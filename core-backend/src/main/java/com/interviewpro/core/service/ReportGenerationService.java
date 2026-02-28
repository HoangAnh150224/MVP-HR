package com.interviewpro.core.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.interviewpro.core.model.entity.Report;
import com.interviewpro.core.model.entity.Session;
import com.interviewpro.core.model.entity.Transcript;
import com.interviewpro.core.model.enums.SessionState;
import com.interviewpro.core.repository.ReportRepository;
import com.interviewpro.core.repository.TranscriptRepository;
import com.interviewpro.core.websocket.SessionEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportGenerationService {

    private final TranscriptRepository transcriptRepository;
    private final ReportRepository reportRepository;
    private final SessionService sessionService;
    private final LlmOrchestratorClient llmClient;
    private final ObjectMapper objectMapper;
    private final SessionEventPublisher wsPublisher;

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

            // Generate final report
            String finalReportJson = llmClient.generateFinalReport(
                    session.getTargetRole() != null ? session.getTargetRole() : "General",
                    objectMapper.readTree(turnsArray.toString())
            );

            // Parse and enrich with per-turn details
            JsonNode finalReport = objectMapper.readTree(finalReportJson);
            int overallScore = finalReport.has("overallScore") ? finalReport.get("overallScore").asInt() : 0;

            // Save report
            Report report = Report.builder()
                    .sessionId(sessionId)
                    .overallScore(overallScore)
                    .reportData(finalReportJson)
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

    private record QAPair(String question, String answer) {}
}
