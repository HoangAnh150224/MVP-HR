package fu.se.hrbackend.controller;

import fu.se.hrbackend.model.entity.*;
import fu.se.hrbackend.service.KbAdminService;
import fu.se.hrbackend.service.KbImportService;
import fu.se.hrbackend.service.KnowledgeBaseService;
import fu.se.hrbackend.repository.KbImportJobRepository;
import fu.se.hrbackend.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/kb")
@RequiredArgsConstructor
@Slf4j
public class KbAdminController {

    private final KbAdminService adminService;
    private final KbImportService importService;
    private final KnowledgeBaseService kbService;
    private final KbImportJobRepository importJobRepository;

    // ── Industries ──

    @GetMapping("/industries")
    public List<KbIndustry> listIndustries() {
        return adminService.listIndustries();
    }

    @PostMapping("/industries")
    @ResponseStatus(HttpStatus.CREATED)
    public KbIndustry createIndustry(@RequestBody Map<String, Object> data) {
        return adminService.createIndustry(data);
    }

    @PutMapping("/industries/{id}")
    public KbIndustry updateIndustry(@PathVariable UUID id, @RequestBody Map<String, Object> data) {
        return adminService.updateIndustry(id, data);
    }

    @DeleteMapping("/industries/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIndustry(@PathVariable UUID id) {
        adminService.deleteIndustry(id);
    }

    // ── Role Templates ──

    @GetMapping("/role-templates")
    public List<KbRoleTemplate> listRoleTemplates() {
        return adminService.listRoleTemplates();
    }

    @PostMapping("/role-templates")
    @ResponseStatus(HttpStatus.CREATED)
    public KbRoleTemplate createRoleTemplate(@RequestBody Map<String, Object> data) {
        return adminService.createRoleTemplate(data);
    }

    @PutMapping("/role-templates/{id}")
    public KbRoleTemplate updateRoleTemplate(@PathVariable UUID id, @RequestBody Map<String, Object> data) {
        return adminService.updateRoleTemplate(id, data);
    }

    @DeleteMapping("/role-templates/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRoleTemplate(@PathVariable UUID id) {
        adminService.deleteRoleTemplate(id);
    }

    // ── Questions ──

    @GetMapping("/questions")
    public List<KbQuestion> listQuestions() {
        return adminService.listQuestions();
    }

    @GetMapping("/questions/{id}")
    public KbQuestion getQuestion(@PathVariable UUID id) {
        return adminService.getQuestion(id);
    }

    @PostMapping("/questions")
    @ResponseStatus(HttpStatus.CREATED)
    public KbQuestion createQuestion(@RequestBody Map<String, Object> data) {
        return adminService.createQuestion(data);
    }

    @PutMapping("/questions/{id}")
    public KbQuestion updateQuestion(@PathVariable UUID id, @RequestBody Map<String, Object> data) {
        return adminService.updateQuestion(id, data);
    }

    @DeleteMapping("/questions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQuestion(@PathVariable UUID id) {
        adminService.deleteQuestion(id);
    }

    // ── Scoring Rubrics ──

    @GetMapping("/scoring-rubrics")
    public List<KbScoringRubric> listScoringRubrics() {
        return adminService.listScoringRubrics();
    }

    @PutMapping("/scoring-rubrics/{id}")
    public KbScoringRubric updateScoringRubric(@PathVariable UUID id, @RequestBody Map<String, Object> data) {
        return adminService.updateScoringRubric(id, data);
    }

    // ── Conversation Templates ──

    @GetMapping("/conversation-templates")
    public List<KbConversationTemplate> listConversationTemplates() {
        return adminService.listConversationTemplates();
    }

    @PostMapping("/conversation-templates")
    @ResponseStatus(HttpStatus.CREATED)
    public KbConversationTemplate createConversationTemplate(@RequestBody Map<String, Object> data) {
        return adminService.createConversationTemplate(data);
    }

    @PutMapping("/conversation-templates/{id}")
    public KbConversationTemplate updateConversationTemplate(@PathVariable UUID id, @RequestBody Map<String, Object> data) {
        return adminService.updateConversationTemplate(id, data);
    }

    @DeleteMapping("/conversation-templates/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteConversationTemplate(@PathVariable UUID id) {
        adminService.deleteConversationTemplate(id);
    }

    // ── Import ──

    @PostMapping("/import")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public KbImportJob importFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "questions") String type,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return importService.startImport(file, type, userId);
    }

    @GetMapping("/import/{jobId}")
    public KbImportJob getImportStatus(@PathVariable UUID jobId) {
        return importJobRepository.findById(jobId)
                .orElseThrow(() -> BusinessException.notFound("Import job not found"));
    }

    // ── Stats ──

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return kbService.getStats();
    }
}
