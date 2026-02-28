package fu.se.hrbackend.controller;

import fu.se.hrbackend.exception.BusinessException;
import fu.se.hrbackend.model.entity.Report;
import fu.se.hrbackend.model.entity.Session;
import fu.se.hrbackend.model.entity.Transcript;
import fu.se.hrbackend.model.entity.User;
import fu.se.hrbackend.model.enums.Role;
import fu.se.hrbackend.repository.ReportRepository;
import fu.se.hrbackend.repository.TranscriptRepository;
import fu.se.hrbackend.repository.UserRepository;
import fu.se.hrbackend.service.AdminService;
import fu.se.hrbackend.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final SessionService sessionService;
    private final ReportRepository reportRepository;
    private final TranscriptRepository transcriptRepository;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return adminService.getPlatformStats();
    }

    @GetMapping("/users")
    public Map<String, Object> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<User> usersPage = adminService.getUsers(page, size);
        List<Map<String, Object>> users = usersPage.getContent().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId().toString());
            m.put("email", u.getEmail());
            m.put("name", u.getName());
            m.put("role", u.getRole().name());
            m.put("createdAt", u.getCreatedAt().toString());
            return m;
        }).toList();
        return Map.of(
                "users", users,
                "totalElements", usersPage.getTotalElements(),
                "totalPages", usersPage.getTotalPages(),
                "page", page
        );
    }

    @GetMapping("/users/{id}")
    public Map<String, Object> getUserDetail(@PathVariable UUID id) {
        return adminService.getUserDetail(id);
    }

    @PatchMapping("/users/{id}/role")
    public Map<String, String> updateRole(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        if (newRole == null) {
            throw BusinessException.badRequest("role is required");
        }
        Role role;
        try {
            role = Role.valueOf(newRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw BusinessException.badRequest("Invalid role: " + newRole);
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("User not found"));
        user.setRole(role);
        userRepository.save(user);

        return Map.of("status", "role_updated", "role", role.name());
    }

    @GetMapping("/sessions")
    public Map<String, Object> getSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Session> sessionsPage = adminService.getAllSessions(page, size);
        return Map.of(
                "sessions", sessionsPage.getContent(),
                "totalElements", sessionsPage.getTotalElements(),
                "totalPages", sessionsPage.getTotalPages(),
                "page", page
        );
    }

    @GetMapping("/sessions/{id}")
    public Map<String, Object> getSessionDetail(@PathVariable UUID id) {
        Session session = sessionService.getById(id);
        List<Transcript> transcripts = transcriptRepository.findBySessionIdOrderByTurnIndexAsc(id);
        Optional<Report> report = reportRepository.findBySessionId(id);

        Map<String, Object> result = new HashMap<>();
        result.put("session", session);
        result.put("transcripts", transcripts);
        report.ifPresent(r -> result.put("report", r));

        return result;
    }
}
