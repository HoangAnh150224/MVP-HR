package fu.se.hrbackend.service;

import fu.se.hrbackend.exception.BusinessException;
import fu.se.hrbackend.model.dto.CreateSessionRequest;
import fu.se.hrbackend.model.entity.Session;
import fu.se.hrbackend.model.entity.User;
import fu.se.hrbackend.model.enums.Role;
import fu.se.hrbackend.model.enums.SessionState;
import fu.se.hrbackend.repository.SessionRepository;
import fu.se.hrbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final SessionRepository sessionRepository;
    private final SessionStateMachine stateMachine;
    private final ApplicationEventPublisher eventPublisher;
    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    public Session create(UUID userId, CreateSessionRequest request) {
        // ADMIN bypasses subscription limits
        User user = userRepository.findById(userId).orElse(null);
        boolean isAdmin = user != null && user.getRole() == Role.ADMIN;

        if (!isAdmin && !subscriptionService.canStartSession(userId)) {
            throw new BusinessException(
                    org.springframework.http.HttpStatus.PAYMENT_REQUIRED,
                    "SESSION_LIMIT_REACHED",
                    "Bạn đã đạt giới hạn phiên miễn phí tuần này. Hãy nâng cấp để tiếp tục."
            );
        }

        Session session = Session.builder()
                .userId(userId)
                .targetRole(request.getTargetRole())
                .difficulty(request.getDifficulty())
                .mode(request.getMode())
                .build();
        return sessionRepository.save(session);
    }

    public Session save(Session session) {
        return sessionRepository.save(session);
    }

    public Session transitionState(UUID sessionId, SessionState newState) {
        Session session = getById(sessionId);
        SessionState oldState = session.getState();
        stateMachine.transitionTo(session, newState);
        Session saved = sessionRepository.save(session);

        // Publish state change event
        eventPublisher.publishEvent(new SessionStateChangedEvent(sessionId, oldState, newState));

        return saved;
    }

    public Session getById(UUID id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Session not found"));
    }

    public List<Session> getByUserId(UUID userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public record SessionStateChangedEvent(UUID sessionId, SessionState oldState, SessionState newState) {}
}
