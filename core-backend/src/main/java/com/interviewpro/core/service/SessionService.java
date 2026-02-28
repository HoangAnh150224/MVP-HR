package com.interviewpro.core.service;

import com.interviewpro.core.exception.BusinessException;
import com.interviewpro.core.model.dto.CreateSessionRequest;
import com.interviewpro.core.model.entity.Session;
import com.interviewpro.core.model.enums.SessionState;
import com.interviewpro.core.repository.SessionRepository;
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

    public Session create(UUID userId, CreateSessionRequest request) {
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
