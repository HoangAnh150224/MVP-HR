package fu.se.hrbackend.controller;

import fu.se.hrbackend.exception.BusinessException;
import fu.se.hrbackend.model.entity.KbConversationTemplate;
import fu.se.hrbackend.model.entity.Session;
import fu.se.hrbackend.model.enums.SessionState;
import fu.se.hrbackend.service.InterviewDispatchService;
import fu.se.hrbackend.service.KnowledgeBaseService;
import fu.se.hrbackend.service.SessionService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/interview")
@RequiredArgsConstructor
@Slf4j
public class InterviewController {

    private final SessionService sessionService;
    private final InterviewDispatchService dispatchService;
    private final KnowledgeBaseService knowledgeBaseService;
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
                JsonNode questionPlanNode = objectMapper.readTree(session.getQuestionPlan());
                metaNode.set("questionPlan", questionPlanNode);
                log.info("Session {} questionPlan has {} questions, targetRole={}",
                        sessionId,
                        questionPlanNode.has("questions") ? questionPlanNode.get("questions").size() : 0,
                        questionPlanNode.has("targetRole") ? questionPlanNode.get("targetRole").asText() : "none");
            } else {
                log.info("Session {} has no questionPlan, voice-agent will use defaults", sessionId);
            }
        } catch (Exception e) {
            log.warn("Session {} failed to parse questionPlan: {}", sessionId, e.getMessage());
        }

        // Load conversation templates from KB
        try {
            List<KbConversationTemplate> templates = knowledgeBaseService.getConversationTemplates(
                    List.of("opening", "transition", "encouragement", "closing", "probing"), "vi");
            if (!templates.isEmpty()) {
                ObjectNode templatesNode = objectMapper.createObjectNode();
                for (KbConversationTemplate t : templates) {
                    if (!templatesNode.has(t.getType())) {
                        templatesNode.set(t.getType(), objectMapper.createArrayNode());
                    }
                    ((ArrayNode) templatesNode.get(t.getType())).add(t.getTemplateText());
                }
                metaNode.set("conversationTemplates", templatesNode);
                log.info("Session {} loaded {} conversation templates from KB", sessionId, templates.size());
            }
        } catch (Exception e) {
            log.warn("Session {} failed to load conversation templates: {}", sessionId, e.getMessage());
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
