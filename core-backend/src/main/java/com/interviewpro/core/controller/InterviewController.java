package com.interviewpro.core.controller;

import com.interviewpro.core.exception.BusinessException;
import com.interviewpro.core.model.entity.Session;
import com.interviewpro.core.model.enums.SessionState;
import com.interviewpro.core.service.InterviewDispatchService;
import com.interviewpro.core.service.SessionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final SessionService sessionService;
    private final InterviewDispatchService dispatchService;
    private final ObjectMapper objectMapper;

    @PostMapping("/start/{sessionId}")
    public Map<String, Object> startInterview(@PathVariable UUID sessionId, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        Session session = sessionService.getById(sessionId);

        if (!session.getUserId().equals(userId)) {
            throw BusinessException.forbidden("Not your session");
        }

        // Transition session state to JOINING via state machine
        session = sessionService.transitionState(sessionId, SessionState.JOINING);

        // Build metadata for voice agent
        ObjectNode metaNode = objectMapper.createObjectNode();
        metaNode.put("sessionId", sessionId.toString());
        metaNode.put("locale", "vi");
        try {
            if (session.getQuestionPlan() != null) {
                metaNode.set("questionPlan", objectMapper.readTree(session.getQuestionPlan()));
            }
        } catch (Exception e) {
            // ignore parse error, agent will use defaults
        }

        String metadata;
        try {
            metadata = objectMapper.writeValueAsString(metaNode);
        } catch (Exception e) {
            metadata = String.format("{\"sessionId\":\"%s\",\"locale\":\"vi\"}", sessionId);
        }

        // Notify voice-agent-service
        dispatchService.startSession(sessionId.toString(), metadata);

        // Return WebSocket URL and metadata for browser to connect
        String wsUrl = dispatchService.getVoiceAgentWsUrl();

        return Map.of(
                "wsUrl", wsUrl + "/ws/interview",
                "sessionId", sessionId.toString(),
                "metadata", metaNode
        );
    }
}
