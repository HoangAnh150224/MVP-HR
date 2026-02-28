package fu.se.hrbackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import fu.se.hrbackend.config.LlmOrchestratorConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class LlmOrchestratorClient {

    private final LlmOrchestratorConfig llmConfig;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${app.internal-api-key:}")
    private String internalApiKey;

    /**
     * Score a single turn (question + answer).
     * POST /internal/scoring/turn
     * Returns raw JSON string of turn score.
     */
    public String scoreTurn(String question, String answer, String category, String difficulty) {
        Map<String, String> body = Map.of(
                "question", question,
                "answer", answer,
                "category", category != null ? category : "general",
                "difficulty", difficulty != null ? difficulty : "mid"
        );
        return callLlm("/internal/scoring/turn", body);
    }

    /**
     * Generate final report from scored turns with optional speech/vision metrics.
     * POST /internal/scoring/final
     * Returns raw JSON string of full report.
     */
    public String generateFinalReport(String targetRole, Object turns, Object speechMetrics, Object visionMetrics) {
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("targetRole", targetRole);
        body.put("turns", turns);
        if (speechMetrics != null) body.put("speechMetrics", speechMetrics);
        if (visionMetrics != null) body.put("visionMetrics", visionMetrics);
        return callLlm("/internal/scoring/final", body);
    }

    private String callLlm(String path, Object body) {
        try {
            String url = llmConfig.getUrl() + path;
            String json = objectMapper.writeValueAsString(body);

            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .timeout(Duration.ofSeconds(120))
                    .POST(HttpRequest.BodyPublishers.ofString(json));

            if (internalApiKey != null && !internalApiKey.isBlank()) {
                builder.header("X-Internal-Api-Key", internalApiKey);
            }

            HttpRequest request = builder.build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                throw new RuntimeException("LLM orchestrator " + path + " returned " + response.statusCode() + ": " + response.body());
            }

            return response.body();
        } catch (Exception e) {
            log.error("Failed to call LLM orchestrator {}: {}", path, e.getMessage());
            throw new RuntimeException("LLM orchestrator call failed: " + e.getMessage(), e);
        }
    }
}
