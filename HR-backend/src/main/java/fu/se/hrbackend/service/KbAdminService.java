package fu.se.hrbackend.service;

import fu.se.hrbackend.exception.BusinessException;
import fu.se.hrbackend.model.entity.*;
import fu.se.hrbackend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class KbAdminService {

    private final KbIndustryRepository industryRepository;
    private final KbRoleTemplateRepository roleTemplateRepository;
    private final KbQuestionRepository questionRepository;
    private final KbScoringRubricRepository scoringRubricRepository;
    private final KbConversationTemplateRepository conversationTemplateRepository;

    // ── Industries CRUD ──

    public List<KbIndustry> listIndustries() {
        return industryRepository.findByIsActiveTrueOrderByNameAsc();
    }

    public KbIndustry createIndustry(Map<String, Object> data) {
        KbIndustry industry = KbIndustry.builder()
                .name((String) data.get("name"))
                .slug((String) data.get("slug"))
                .description((String) data.get("description"))
                .build();
        return industryRepository.save(industry);
    }

    public KbIndustry updateIndustry(UUID id, Map<String, Object> data) {
        KbIndustry industry = industryRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Industry not found"));
        if (data.containsKey("name")) industry.setName((String) data.get("name"));
        if (data.containsKey("slug")) industry.setSlug((String) data.get("slug"));
        if (data.containsKey("description")) industry.setDescription((String) data.get("description"));
        if (data.containsKey("isActive")) industry.setIsActive((Boolean) data.get("isActive"));
        return industryRepository.save(industry);
    }

    public void deleteIndustry(UUID id) {
        KbIndustry industry = industryRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Industry not found"));
        industry.setIsActive(false);
        industryRepository.save(industry);
    }

    // ── Role Templates CRUD ──

    public List<KbRoleTemplate> listRoleTemplates() {
        return roleTemplateRepository.findByIsActiveTrueOrderByNameAsc();
    }

    public KbRoleTemplate createRoleTemplate(Map<String, Object> data) {
        KbRoleTemplate template = KbRoleTemplate.builder()
                .name((String) data.get("name"))
                .slug((String) data.get("slug"))
                .description((String) data.get("description"))
                .typicalSkills(data.containsKey("typicalSkills") ? data.get("typicalSkills").toString() : "[]")
                .typicalJd((String) data.get("typicalJd"))
                .difficulty(data.containsKey("difficulty") ? (String) data.get("difficulty") : "mid")
                .build();
        if (data.containsKey("industryId")) {
            template.setIndustryId(UUID.fromString((String) data.get("industryId")));
        }
        return roleTemplateRepository.save(template);
    }

    public KbRoleTemplate updateRoleTemplate(UUID id, Map<String, Object> data) {
        KbRoleTemplate template = roleTemplateRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Role template not found"));
        if (data.containsKey("name")) template.setName((String) data.get("name"));
        if (data.containsKey("slug")) template.setSlug((String) data.get("slug"));
        if (data.containsKey("description")) template.setDescription((String) data.get("description"));
        if (data.containsKey("typicalSkills")) template.setTypicalSkills(data.get("typicalSkills").toString());
        if (data.containsKey("typicalJd")) template.setTypicalJd((String) data.get("typicalJd"));
        if (data.containsKey("difficulty")) template.setDifficulty((String) data.get("difficulty"));
        if (data.containsKey("isActive")) template.setIsActive((Boolean) data.get("isActive"));
        if (data.containsKey("industryId")) {
            template.setIndustryId(UUID.fromString((String) data.get("industryId")));
        }
        return roleTemplateRepository.save(template);
    }

    public void deleteRoleTemplate(UUID id) {
        KbRoleTemplate template = roleTemplateRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Role template not found"));
        template.setIsActive(false);
        roleTemplateRepository.save(template);
    }

    // ── Questions CRUD ──

    public List<KbQuestion> listQuestions() {
        return questionRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    public KbQuestion getQuestion(UUID id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Question not found"));
    }

    public KbQuestion createQuestion(Map<String, Object> data) {
        KbQuestion question = KbQuestion.builder()
                .category((String) data.get("category"))
                .topic((String) data.get("topic"))
                .difficulty(data.containsKey("difficulty") ? (String) data.get("difficulty") : "mid")
                .questionText((String) data.get("questionText"))
                .followUps(data.containsKey("followUps") ? data.get("followUps").toString() : "[]")
                .sampleAnswers(data.containsKey("sampleAnswers") ? data.get("sampleAnswers").toString() : "{}")
                .scoringRubric(data.containsKey("scoringRubric") ? data.get("scoringRubric").toString() : "{}")
                .tags(data.containsKey("tags") ? data.get("tags").toString() : "[]")
                .build();
        if (data.containsKey("roleTemplateId") && data.get("roleTemplateId") != null) {
            question.setRoleTemplateId(UUID.fromString((String) data.get("roleTemplateId")));
        }
        return questionRepository.save(question);
    }

    public KbQuestion updateQuestion(UUID id, Map<String, Object> data) {
        KbQuestion question = questionRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Question not found"));
        if (data.containsKey("category")) question.setCategory((String) data.get("category"));
        if (data.containsKey("topic")) question.setTopic((String) data.get("topic"));
        if (data.containsKey("difficulty")) question.setDifficulty((String) data.get("difficulty"));
        if (data.containsKey("questionText")) question.setQuestionText((String) data.get("questionText"));
        if (data.containsKey("followUps")) question.setFollowUps(data.get("followUps").toString());
        if (data.containsKey("sampleAnswers")) question.setSampleAnswers(data.get("sampleAnswers").toString());
        if (data.containsKey("scoringRubric")) question.setScoringRubric(data.get("scoringRubric").toString());
        if (data.containsKey("tags")) question.setTags(data.get("tags").toString());
        if (data.containsKey("isActive")) question.setIsActive((Boolean) data.get("isActive"));
        if (data.containsKey("roleTemplateId")) {
            Object roleId = data.get("roleTemplateId");
            question.setRoleTemplateId(roleId != null ? UUID.fromString(roleId.toString()) : null);
        }
        return questionRepository.save(question);
    }

    public void deleteQuestion(UUID id) {
        KbQuestion question = questionRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Question not found"));
        question.setIsActive(false);
        questionRepository.save(question);
    }

    // ── Scoring Rubrics CRUD ──

    public List<KbScoringRubric> listScoringRubrics() {
        return scoringRubricRepository.findByIsActiveTrueOrderByWeightPercentDesc();
    }

    public KbScoringRubric updateScoringRubric(UUID id, Map<String, Object> data) {
        KbScoringRubric rubric = scoringRubricRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Scoring rubric not found"));
        if (data.containsKey("name")) rubric.setName((String) data.get("name"));
        if (data.containsKey("description")) rubric.setDescription((String) data.get("description"));
        if (data.containsKey("weightPercent")) rubric.setWeightPercent((Integer) data.get("weightPercent"));
        if (data.containsKey("scoreLevels")) rubric.setScoreLevels(data.get("scoreLevels").toString());
        if (data.containsKey("isActive")) rubric.setIsActive((Boolean) data.get("isActive"));
        return scoringRubricRepository.save(rubric);
    }

    // ── Conversation Templates CRUD ──

    public List<KbConversationTemplate> listConversationTemplates() {
        return conversationTemplateRepository.findByIsActiveTrueOrderBySortOrderAsc();
    }

    public KbConversationTemplate createConversationTemplate(Map<String, Object> data) {
        KbConversationTemplate template = KbConversationTemplate.builder()
                .type((String) data.get("type"))
                .name((String) data.get("name"))
                .templateText((String) data.get("templateText"))
                .locale(data.containsKey("locale") ? (String) data.get("locale") : "vi")
                .sortOrder(data.containsKey("sortOrder") ? (Integer) data.get("sortOrder") : 0)
                .build();
        return conversationTemplateRepository.save(template);
    }

    public KbConversationTemplate updateConversationTemplate(UUID id, Map<String, Object> data) {
        KbConversationTemplate template = conversationTemplateRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Conversation template not found"));
        if (data.containsKey("type")) template.setType((String) data.get("type"));
        if (data.containsKey("name")) template.setName((String) data.get("name"));
        if (data.containsKey("templateText")) template.setTemplateText((String) data.get("templateText"));
        if (data.containsKey("sortOrder")) template.setSortOrder((Integer) data.get("sortOrder"));
        if (data.containsKey("isActive")) template.setIsActive((Boolean) data.get("isActive"));
        return conversationTemplateRepository.save(template);
    }

    public void deleteConversationTemplate(UUID id) {
        KbConversationTemplate template = conversationTemplateRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Conversation template not found"));
        template.setIsActive(false);
        conversationTemplateRepository.save(template);
    }
}
