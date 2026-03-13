package fu.se.hrbackend.controller;

import fu.se.hrbackend.model.entity.KbConversationTemplate;
import fu.se.hrbackend.model.entity.KbQuestion;
import fu.se.hrbackend.model.entity.KbRoleTemplate;
import fu.se.hrbackend.model.entity.KbScoringRubric;
import fu.se.hrbackend.service.KnowledgeBaseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/internal/kb")
@RequiredArgsConstructor
@Slf4j
public class InternalKnowledgeBaseController {

    private final KnowledgeBaseService kbService;

    /**
     * Search questions by role, category, difficulty.
     * GET /internal/kb/questions/search?roleSlug=backend-developer&category=expertise&difficulty=mid&limit=10
     */
    @GetMapping("/questions/search")
    public List<KbQuestion> searchQuestions(
            @RequestParam(required = false) String roleSlug,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "10") int limit) {

        UUID roleTemplateId = null;
        if (roleSlug != null) {
            roleTemplateId = kbService.matchRole(roleSlug)
                    .map(KbRoleTemplate::getId)
                    .orElse(null);
        }

        return kbService.searchQuestions(roleTemplateId, category, difficulty, limit);
    }

    /**
     * Match a target role to a KB role template.
     * GET /internal/kb/roles/match?targetRole=Backend Developer&difficulty=mid
     */
    @GetMapping("/roles/match")
    public Map<String, Object> matchRole(
            @RequestParam String targetRole,
            @RequestParam(defaultValue = "mid") String difficulty) {

        return kbService.buildQuestionGenerationContext(targetRole, difficulty);
    }

    /**
     * Get scoring rubrics for a role template.
     * GET /internal/kb/roles/{id}/rubrics
     */
    @GetMapping("/roles/{id}/rubrics")
    public List<KbScoringRubric> getRubrics(@PathVariable UUID id) {
        return kbService.getDefaultScoringRubrics();
    }

    /**
     * Get conversation templates by type and locale.
     * GET /internal/kb/conversation-templates?locale=vi&types=opening,transition
     */
    @GetMapping("/conversation-templates")
    public List<KbConversationTemplate> getConversationTemplates(
            @RequestParam(defaultValue = "vi") String locale,
            @RequestParam(required = false) List<String> types) {

        return kbService.getConversationTemplates(types, locale);
    }

    /**
     * Get default scoring rubrics (5 criteria).
     * GET /internal/kb/scoring-rubrics/default
     */
    @GetMapping("/scoring-rubrics/default")
    public List<KbScoringRubric> getDefaultScoringRubrics() {
        return kbService.getDefaultScoringRubrics();
    }
}
