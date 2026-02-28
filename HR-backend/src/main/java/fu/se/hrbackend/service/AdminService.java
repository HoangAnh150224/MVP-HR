package fu.se.hrbackend.service;

import fu.se.hrbackend.model.entity.Report;
import fu.se.hrbackend.model.entity.Session;
import fu.se.hrbackend.model.entity.User;
import fu.se.hrbackend.repository.ReportRepository;
import fu.se.hrbackend.repository.SessionRepository;
import fu.se.hrbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final ReportRepository reportRepository;

    public Map<String, Object> getPlatformStats() {
        long totalUsers = userRepository.count();
        long totalSessions = sessionRepository.count();

        List<Report> allReports = reportRepository.findAll();
        double avgScore = allReports.stream()
                .filter(r -> r.getOverallScore() != null)
                .mapToInt(Report::getOverallScore)
                .average()
                .orElse(0);

        // Active users (had a session in last 7 days)
        OffsetDateTime weekAgo = OffsetDateTime.now().minusDays(7);
        long activeUsers = sessionRepository.findAll().stream()
                .filter(s -> s.getCreatedAt().isAfter(weekAgo))
                .map(Session::getUserId)
                .distinct()
                .count();

        return Map.of(
                "totalUsers", totalUsers,
                "totalSessions", totalSessions,
                "averageScore", Math.round(avgScore),
                "activeUsers", activeUsers
        );
    }

    public Page<User> getUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    public Map<String, Object> getUserDetail(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<Session> sessions = sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);

        List<Map<String, Object>> sessionSummaries = sessions.stream().map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId().toString());
            m.put("targetRole", s.getTargetRole());
            m.put("state", s.getState().name());
            m.put("createdAt", s.getCreatedAt().toString());
            reportRepository.findBySessionId(s.getId())
                    .ifPresent(r -> m.put("score", r.getOverallScore()));
            return m;
        }).toList();

        return Map.of(
                "id", user.getId().toString(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().name(),
                "createdAt", user.getCreatedAt().toString(),
                "sessions", sessionSummaries,
                "totalSessions", sessions.size()
        );
    }

    public Page<Session> getAllSessions(int page, int size) {
        return sessionRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }
}
