package fu.se.hrbackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import fu.se.hrbackend.model.entity.*;
import fu.se.hrbackend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgeBaseService {

    private final KbQuestionRepository questionRepository;
    private final KbRoleTemplateRepository roleTemplateRepository;
    private final KbScoringRubricRepository scoringRubricRepository;
    private final KbConversationTemplateRepository conversationTemplateRepository;
    private final KbIndustryRepository industryRepository;
    private final ObjectMapper objectMapper;

    /**
     * Search questions by role, category, difficulty with limit.
     * Prioritizes role-specific questions, then general questions.
     */
    public List<KbQuestion> searchQuestions(UUID roleTemplateId, String category, String difficulty, int limit) {
        List<KbQuestion> results = questionRepository.searchQuestions(roleTemplateId, category, difficulty);
        if (results.size() > limit) {
            return results.subList(0, limit);
        }
        return results;
    }

    /**
     * Get balanced questions: 2 per category for 5 categories = 10 questions.
     */
    public List<KbQuestion> getBalancedQuestions(UUID roleTemplateId, String difficulty, int perCategory) {
        List<String> categories = List.of("confidence", "communication", "problem_solving", "expertise", "attitude");
        List<KbQuestion> result = new ArrayList<>();

        for (String category : categories) {
            List<KbQuestion> catQuestions = searchQuestions(roleTemplateId, category, difficulty, perCategory);
            result.addAll(catQuestions);
        }

        return result;
    }

    /**
     * Match a target role string to a KbRoleTemplate.
     * Tries exact slug match first, then keyword search.
     */
    public Optional<KbRoleTemplate> matchRole(String targetRole) {
        if (targetRole == null || targetRole.isBlank()) {
            return Optional.empty();
        }

        // Try exact slug match
        String slug = targetRole.toLowerCase().trim().replaceAll("\\s+", "-");
        Optional<KbRoleTemplate> bySlug = roleTemplateRepository.findBySlug(slug);
        if (bySlug.isPresent()) {
            return bySlug;
        }

        // Try keyword search
        List<KbRoleTemplate> matches = roleTemplateRepository.searchByName(targetRole.trim());
        if (!matches.isEmpty()) {
            return Optional.of(matches.get(0));
        }

        return Optional.empty();
    }

    /**
     * Get all active scoring rubrics (default 5 criteria).
     */
    public List<KbScoringRubric> getDefaultScoringRubrics() {
        return scoringRubricRepository.findByIsActiveTrueOrderByWeightPercentDesc();
    }

    /**
     * Get conversation templates by types and locale.
     */
    public List<KbConversationTemplate> getConversationTemplates(List<String> types, String locale) {
        if (types == null || types.isEmpty()) {
            return conversationTemplateRepository.findByIsActiveTrueOrderBySortOrderAsc();
        }
        return conversationTemplateRepository.findByTypeInAndLocaleAndIsActiveTrueOrderBySortOrderAsc(types, locale);
    }

    /**
     * Build KB context for question generation.
     * Returns a map with referenceQuestions, roleTemplate, scoringCriteria.
     */
    public Map<String, Object> buildQuestionGenerationContext(String targetRole, String difficulty) {
        Map<String, Object> context = new HashMap<>();

        // Match role
        Optional<KbRoleTemplate> roleOpt = matchRole(targetRole);
        UUID roleTemplateId = roleOpt.map(KbRoleTemplate::getId).orElse(null);

        if (roleOpt.isPresent()) {
            KbRoleTemplate role = roleOpt.get();
            Map<String, Object> roleMap = new HashMap<>();
            roleMap.put("name", role.getName());
            roleMap.put("slug", role.getSlug());
            roleMap.put("description", role.getDescription());
            roleMap.put("typicalSkills", role.getTypicalSkills());
            context.put("roleTemplate", roleMap);
        }

        // Get balanced reference questions (2 per category = 10)
        List<KbQuestion> refQuestions = getBalancedQuestions(roleTemplateId, difficulty, 2);
        List<Map<String, Object>> questionMaps = refQuestions.stream()
                .map(this::questionToMap)
                .collect(Collectors.toList());
        context.put("referenceQuestions", questionMaps);

        // Get scoring criteria
        List<KbScoringRubric> rubrics = getDefaultScoringRubrics();
        List<Map<String, Object>> rubricMaps = rubrics.stream()
                .map(r -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", r.getName());
                    m.put("slug", r.getSlug());
                    m.put("weightPercent", r.getWeightPercent());
                    m.put("description", r.getDescription());
                    return m;
                })
                .collect(Collectors.toList());
        context.put("scoringCriteria", rubricMaps);

        return context;
    }

    /**
     * Build KB context for scoring a turn.
     * Tries to find a matching KB question for the interview question.
     */
    public Map<String, Object> buildScoringContext(String questionText, String category) {
        Map<String, Object> context = new HashMap<>();

        // Search for a matching question in KB
        List<KbQuestion> matches = questionRepository.searchByText(
                questionText.length() > 50 ? questionText.substring(0, 50) : questionText
        );

        if (!matches.isEmpty()) {
            KbQuestion match = matches.get(0);
            context.put("sampleAnswers", match.getSampleAnswers());
            context.put("scoringRubric", match.getScoringRubric());
        }

        // Get category rubric
        if (category != null) {
            String rubricSlug = mapCategoryToRubricSlug(category);
            scoringRubricRepository.findBySlug(rubricSlug).ifPresent(rubric -> {
                Map<String, Object> rubricMap = new HashMap<>();
                rubricMap.put("name", rubric.getName());
                rubricMap.put("weightPercent", rubric.getWeightPercent());
                rubricMap.put("scoreLevels", rubric.getScoreLevels());
                context.put("categoryRubric", rubricMap);
            });
        }

        return context;
    }

    /**
     * Build KB context for final report generation.
     */
    public Map<String, Object> buildReportContext(String targetRole) {
        Map<String, Object> context = new HashMap<>();

        // Scoring rubrics
        List<KbScoringRubric> rubrics = getDefaultScoringRubrics();
        List<Map<String, Object>> rubricMaps = rubrics.stream()
                .map(r -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", r.getName());
                    m.put("slug", r.getSlug());
                    m.put("weightPercent", r.getWeightPercent());
                    m.put("description", r.getDescription());
                    m.put("scoreLevels", r.getScoreLevels());
                    return m;
                })
                .collect(Collectors.toList());
        context.put("scoringRubrics", rubricMaps);

        // Role context
        matchRole(targetRole).ifPresent(role -> {
            Map<String, Object> roleMap = new HashMap<>();
            roleMap.put("name", role.getName());
            roleMap.put("description", role.getDescription());
            roleMap.put("typicalSkills", role.getTypicalSkills());
            context.put("roleContext", roleMap);
        });

        return context;
    }

    /**
     * Get KB stats for admin dashboard.
     */
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalQuestions", questionRepository.countByIsActiveTrue());
        stats.put("totalRoleTemplates", roleTemplateRepository.findByIsActiveTrueOrderByNameAsc().size());
        stats.put("totalIndustries", industryRepository.findByIsActiveTrueOrderByNameAsc().size());
        stats.put("totalRubrics", scoringRubricRepository.findByIsActiveTrueOrderByWeightPercentDesc().size());
        stats.put("totalConversationTemplates", conversationTemplateRepository.findByIsActiveTrueOrderBySortOrderAsc().size());
        return stats;
    }

    private Map<String, Object> questionToMap(KbQuestion q) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", q.getId().toString());
        m.put("category", q.getCategory());
        m.put("topic", q.getTopic());
        m.put("difficulty", q.getDifficulty());
        m.put("questionText", q.getQuestionText());
        m.put("followUps", q.getFollowUps());
        m.put("sampleAnswers", q.getSampleAnswers());
        m.put("scoringRubric", q.getScoringRubric());
        return m;
    }

    private String mapCategoryToRubricSlug(String category) {
        return switch (category.toLowerCase()) {
            case "confidence" -> "confidence";
            case "communication" -> "communication";
            case "problem_solving", "problem-solving" -> "problem_solving";
            case "expertise", "technical" -> "expertise";
            case "attitude" -> "attitude";
            default -> "communication";
        };
    }
}
