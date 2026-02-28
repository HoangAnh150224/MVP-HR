package com.interviewpro.core.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class InterviewDispatchService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.voice-agent.url:http://voice-agent-service:8081}")
    private String voiceAgentBaseUrl;

    /**
     * Notify voice-agent-service that a session is starting.
     * The actual audio connection is initiated by the browser via WebSocket.
     */
    public String startSession(String sessionId, String metadata) {
        try {
            String url = voiceAgentBaseUrl + "/internal/start-session";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                    "sessionId", sessionId,
                    "metadata", metadata != null ? metadata : ""
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            log.info("Voice agent session start response for {}: {} - {}", sessionId, response.getStatusCode(), response.getBody());

            return voiceAgentBaseUrl;
        } catch (Exception e) {
            log.error("Failed to start voice agent session {}: {}", sessionId, e.getMessage());
            return voiceAgentBaseUrl;
        }
    }

    public String getVoiceAgentWsUrl() {
        // Convert HTTP URL to WS URL for browser connection
        return voiceAgentBaseUrl.replace("http://", "ws://").replace("https://", "wss://");
    }
}
