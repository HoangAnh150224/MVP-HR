package fu.se.hrbackend.controller;

import fu.se.hrbackend.exception.BusinessException;
import fu.se.hrbackend.model.dto.CreateSessionRequest;
import fu.se.hrbackend.model.entity.Report;
import fu.se.hrbackend.model.entity.Session;
import fu.se.hrbackend.model.entity.Transcript;
import fu.se.hrbackend.model.enums.SessionState;
import fu.se.hrbackend.repository.ReportRepository;
import fu.se.hrbackend.repository.TranscriptRepository;
import fu.se.hrbackend.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final TranscriptRepository transcriptRepository;
    private final ReportRepository reportRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Session create(@Valid @RequestBody CreateSessionRequest request, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return sessionService.create(userId, request);
    }

    @GetMapping
    public List<Session> list(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return sessionService.getByUserId(userId);
    }

    @GetMapping("/{id}")
    public Session get(@PathVariable UUID id) {
        return sessionService.getById(id);
    }

    @PostMapping("/{id}/consent")
    public Map<String, String> consent(@PathVariable UUID id, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        Session session = sessionService.getById(id);

        if (!session.getUserId().equals(userId)) {
            throw BusinessException.forbidden("Not your session");
        }

        session.setConsentGivenAt(OffsetDateTime.now());
        sessionService.save(session);
        sessionService.transitionState(id, SessionState.CONSENT_PENDING);

        return Map.of("status", "consented");
    }

    @PostMapping("/{id}/end")
    public Map<String, String> end(@PathVariable UUID id, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        Session session = sessionService.getById(id);

        if (!session.getUserId().equals(userId)) {
            throw BusinessException.forbidden("Not your session");
        }

        sessionService.transitionState(id, SessionState.ENDED);

        return Map.of("status", "ended");
    }

    @GetMapping("/{id}/transcripts")
    public List<Transcript> getTranscripts(@PathVariable UUID id, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        Session session = sessionService.getById(id);
        if (!session.getUserId().equals(userId)) {
            throw BusinessException.forbidden("Not your session");
        }
        return transcriptRepository.findBySessionIdOrderByTurnIndexAsc(id);
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        List<Session> sessions = sessionService.getByUserId(userId);

        int totalSessions = sessions.size();
        List<Integer> scores = new ArrayList<>();

        for (Session s : sessions) {
            reportRepository.findBySessionId(s.getId())
                    .ifPresent(r -> {
                        if (r.getOverallScore() != null) scores.add(r.getOverallScore());
                    });
        }

        double avgScore = scores.isEmpty() ? 0 : scores.stream().mapToInt(Integer::intValue).average().orElse(0);
        int bestScore = scores.isEmpty() ? 0 : scores.stream().mapToInt(Integer::intValue).max().orElse(0);

        // Score history: last 10 scores in chronological order
        List<Integer> scoreHistory = scores.size() > 10
                ? scores.subList(scores.size() - 10, scores.size())
                : scores;

        return Map.of(
                "totalSessions", totalSessions,
                "averageScore", Math.round(avgScore),
                "bestScore", bestScore,
                "scoreHistory", scoreHistory
        );
    }
}
