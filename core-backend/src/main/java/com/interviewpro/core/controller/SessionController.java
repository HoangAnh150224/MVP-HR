package com.interviewpro.core.controller;

import com.interviewpro.core.exception.BusinessException;
import com.interviewpro.core.model.dto.CreateSessionRequest;
import com.interviewpro.core.model.entity.Session;
import com.interviewpro.core.model.enums.SessionState;
import com.interviewpro.core.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

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
}
