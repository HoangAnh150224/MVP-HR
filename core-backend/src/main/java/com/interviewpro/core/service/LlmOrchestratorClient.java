package com.interviewpro.core.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewpro.core.config.LlmOrchestratorConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
     * Generate final report from scored turns.
     * POST /internal/scoring/final
     * Returns raw JSON string of full report.
     */
    public String generateFinalReport(String targetRole, Object turns) {
        Map<String, Object> body = Map.of(
                "targetRole", targetRole,
                "turns", turns
        );
        return callLlm("/internal/scoring/final", body);
    }

    private String callLlm(String path, Object body) {
        try {
            String url = llmConfig.getUrl() + path;
            String json = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .timeout(Duration.ofSeconds(120))
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

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
