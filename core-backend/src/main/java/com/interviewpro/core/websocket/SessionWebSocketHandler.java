package com.interviewpro.core.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewpro.core.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class SessionWebSocketHandler extends TextWebSocketHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper;

    // sessionId → set of WebSocket sessions
    private final Map<UUID, Set<WebSocketSession>> sessionConnections = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Map<String, String> params = parseQueryParams(session);
        String token = params.get("token");
        String sessionIdStr = params.get("sessionId");

        if (token == null || sessionIdStr == null || !jwtTokenProvider.validateToken(token)) {
            log.warn("WebSocket connection rejected: invalid token or missing sessionId");
            session.close(CloseStatus.POLICY_VIOLATION);
            return;
        }

        UUID sessionId = UUID.fromString(sessionIdStr);
        session.getAttributes().put("sessionId", sessionId);

        sessionConnections
                .computeIfAbsent(sessionId, k -> ConcurrentHashMap.newKeySet())
                .add(session);

        log.info("WebSocket connected for session {}", sessionId);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        UUID sessionId = (UUID) session.getAttributes().get("sessionId");
        if (sessionId != null) {
            Set<WebSocketSession> sessions = sessionConnections.get(sessionId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    sessionConnections.remove(sessionId);
                }
            }
            log.info("WebSocket disconnected for session {}", sessionId);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Client-to-server messages not needed for event broadcasting
    }

    /**
     * Send an event envelope to all connected clients for a given session.
     */
    public void sendEvent(UUID sessionId, String eventType, Object payload) {
        Set<WebSocketSession> sessions = sessionConnections.get(sessionId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }

        try {
            Map<String, Object> envelope = Map.of(
                    "type", eventType,
                    "sessionId", sessionId.toString(),
                    "timestamp", java.time.Instant.now().toString(),
                    "payload", payload
            );
            String json = objectMapper.writeValueAsString(envelope);
            TextMessage textMessage = new TextMessage(json);

            for (WebSocketSession ws : sessions) {
                if (ws.isOpen()) {
                    try {
                        ws.sendMessage(textMessage);
                    } catch (IOException e) {
                        log.warn("Failed to send WS message to session {}: {}", sessionId, e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to serialize WS event for session {}: {}", sessionId, e.getMessage());
        }
    }

    private Map<String, String> parseQueryParams(WebSocketSession session) {
        if (session.getUri() == null) {
            return Map.of();
        }
        var params = UriComponentsBuilder.fromUri(session.getUri()).build().getQueryParams();
        return Map.of(
                "token", params.getFirst("token") != null ? params.getFirst("token") : "",
                "sessionId", params.getFirst("sessionId") != null ? params.getFirst("sessionId") : ""
        );
    }
}
