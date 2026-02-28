package fu.se.hrbackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fu.se.hrbackend.model.entity.Report;
import fu.se.hrbackend.model.entity.Session;
import fu.se.hrbackend.model.entity.SpeechMetrics;
import fu.se.hrbackend.model.entity.Transcript;
import fu.se.hrbackend.model.enums.SessionState;
import fu.se.hrbackend.repository.ReportRepository;
import fu.se.hrbackend.repository.SpeechMetricsRepository;
import fu.se.hrbackend.repository.TranscriptRepository;
import fu.se.hrbackend.websocket.SessionEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportGenerationService {

    private final TranscriptRepository transcriptRepository;
    private final ReportRepository reportRepository;
    private final SpeechMetricsRepository speechMetricsRepository;
    private final SessionService sessionService;
    private final LlmOrchestratorClient llmClient;
    private final ObjectMapper objectMapper;
    private final SessionEventPublisher wsPublisher;

    @Value("${app.vision-analytics.url:}")
    private String visionAnalyticsUrl;

    @Async("scoringExecutor")
    public void generateReport(UUID sessionId) {
        log.info("Starting report generation for session {}", sessionId);

        try {
            Session session = sessionService.getById(sessionId);

            // Transition to SCORING
            sessionService.transitionState(sessionId, SessionState.SCORING);

            // Fetch all transcripts
            List<Transcript> transcripts = transcriptRepository.findBySessionIdOrderByTurnIndexAsc(sessionId);

            if (transcripts.isEmpty()) {
                log.warn("No transcripts found for session {}, generating empty report", sessionId);
                saveEmptyReport(sessionId);
                sessionService.transitionState(sessionId, SessionState.REPORT_READY);
                return;
            }

            // Pair AI questions with user answers
            List<QAPair> qaPairs = pairTranscripts(transcripts);

            // Score each turn
            List<ObjectNode> scoredTurns = new ArrayList<>();
            for (int i = 0; i < qaPairs.size(); i++) {
                QAPair pair = qaPairs.get(i);
                try {
                    String turnScoreJson = llmClient.scoreTurn(
                            pair.question, pair.answer, "general",
                            session.getDifficulty()
                    );
                    ObjectNode turnScore = (ObjectNode) objectMapper.readTree(turnScoreJson);
                    turnScore.put("questionIndex", i);
                    turnScore.put("question", pair.question);
                    turnScore.put("answer", pair.answer);
                    turnScore.put("category", "general");
                    scoredTurns.add(turnScore);
                } catch (Exception e) {
                    log.warn("Failed to score turn {} for session {}: {}", i, sessionId, e.getMessage());
                }
            }

            // Build turns array for final report
            ArrayNode turnsArray = objectMapper.createArrayNode();
            for (ObjectNode st : scoredTurns) {
                ObjectNode turn = objectMapper.createObjectNode();
                turn.put("question", st.get("question").asText());
                turn.put("answer", st.get("answer").asText());
                turn.put("score", st.has("score") ? st.get("score").asInt() : 5);
                turn.put("category", st.has("category") ? st.get("category").asText() : "general");
                turnsArray.add(turn);
            }

            // Gather speech metrics
            List<SpeechMetrics> speechMetricsList = speechMetricsRepository.findBySessionIdOrderByTurnIndexAsc(sessionId);
            ObjectNode speechMetricsNode = buildSpeechMetricsSummary(speechMetricsList);

            // Gather vision metrics
            ObjectNode visionMetricsNode = fetchVisionMetrics(sessionId);

            // Generate final report (with speech + vision data)
            String finalReportJson = llmClient.generateFinalReport(
                    session.getTargetRole() != null ? session.getTargetRole() : "General",
                    objectMapper.readTree(turnsArray.toString()),
                    speechMetricsNode,
                    visionMetricsNode
            );

            // Parse and enrich with speech/vision data
            ObjectNode finalReport = (ObjectNode) objectMapper.readTree(finalReportJson);
            int overallScore = finalReport.has("overallScore") ? finalReport.get("overallScore").asInt() : 0;

            // Attach speech metrics summary to report
            finalReport.set("speechMetrics", speechMetricsNode);
            if (visionMetricsNode != null) {
                finalReport.set("visionMetrics", visionMetricsNode);
            }

            String enrichedReportJson = objectMapper.writeValueAsString(finalReport);

            // Save report
            Report report = Report.builder()
                    .sessionId(sessionId)
                    .overallScore(overallScore)
                    .reportData(enrichedReportJson)
                    .build();
            reportRepository.save(report);

            // Transition to REPORT_READY (also triggers session.state_changed WS event)
            sessionService.transitionState(sessionId, SessionState.REPORT_READY);

            // Publish dedicated report.ready event with score
            wsPublisher.publishReportReady(sessionId, overallScore);

            log.info("Report generated for session {} with overall score {}", sessionId, overallScore);

        } catch (Exception e) {
            log.error("Report generation failed for session {}: {}", sessionId, e.getMessage(), e);
        }
    }

    private List<QAPair> pairTranscripts(List<Transcript> transcripts) {
        List<QAPair> pairs = new ArrayList<>();
        String lastAiText = null;

        for (Transcript t : transcripts) {
            if ("ai".equals(t.getSpeaker())) {
                lastAiText = t.getText();
            } else if ("user".equals(t.getSpeaker()) && lastAiText != null) {
                pairs.add(new QAPair(lastAiText, t.getText()));
                lastAiText = null;
            }
        }

        return pairs;
    }

    private void saveEmptyReport(UUID sessionId) {
        String emptyReport = "{\"overallScore\":0,\"categories\":[],\"turnScores\":[],\"strengths\":[],\"improvements\":[]}";
        Report report = Report.builder()
                .sessionId(sessionId)
                .overallScore(0)
                .reportData(emptyReport)
                .build();
        reportRepository.save(report);
    }

    private ObjectNode buildSpeechMetricsSummary(List<SpeechMetrics> metricsList) {
        ObjectNode summary = objectMapper.createObjectNode();
        if (metricsList.isEmpty()) {
            summary.put("avgWpm", 0);
            summary.put("totalFillers", 0);
            summary.set("topFillers", objectMapper.createObjectNode());
            summary.put("totalUtteranceSeconds", 0);
            return summary;
        }

        double totalWpm = 0;
        int wpmCount = 0;
        double totalUtterance = 0;
        Map<String, Integer> allFillers = new HashMap<>();

        for (SpeechMetrics m : metricsList) {
            if (m.getWpm() != null) {
                totalWpm += m.getWpm();
                wpmCount++;
            }
            if (m.getUtteranceSeconds() != null) {
                totalUtterance += m.getUtteranceSeconds();
            }
            if (m.getFillerCounts() != null) {
                try {
                    JsonNode fillers = objectMapper.readTree(m.getFillerCounts());
                    fillers.fields().forEachRemaining(entry ->
                            allFillers.merge(entry.getKey(), entry.getValue().asInt(), Integer::sum));
                } catch (Exception ignored) {}
            }
        }

        summary.put("avgWpm", wpmCount > 0 ? Math.round(totalWpm / wpmCount) : 0);
        int totalFillers = allFillers.values().stream().mapToInt(Integer::intValue).sum();
        summary.put("totalFillers", totalFillers);
        summary.put("totalUtteranceSeconds", Math.round(totalUtterance));

        ObjectNode topFillers = objectMapper.createObjectNode();
        allFillers.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .forEach(e -> topFillers.put(e.getKey(), e.getValue()));
        summary.set("topFillers", topFillers);

        return summary;
    }

    private ObjectNode fetchVisionMetrics(UUID sessionId) {
        if (visionAnalyticsUrl == null || visionAnalyticsUrl.isBlank()) {
            return null;
        }
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(visionAnalyticsUrl + "/internal/sessions/" + sessionId + "/vision-metrics"))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                return (ObjectNode) objectMapper.readTree(response.body());
            }
        } catch (Exception e) {
            log.warn("Failed to fetch vision metrics for session {}: {}", sessionId, e.getMessage());
        }
        return null;
    }

    private record QAPair(String question, String answer) {}
}
