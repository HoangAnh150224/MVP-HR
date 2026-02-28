package fu.se.hrbackend.service;

import fu.se.hrbackend.exception.BusinessException;
import fu.se.hrbackend.model.entity.Session;
import fu.se.hrbackend.model.enums.SessionState;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

import static fu.se.hrbackend.model.enums.SessionState.*;

@Component
@Slf4j
public class SessionStateMachine {

    private static final Map<SessionState, Set<SessionState>> ALLOWED_TRANSITIONS = Map.of(
            CREATED, Set.of(CV_UPLOADING, CV_PARSED, CONSENT_PENDING, JOINING),
            CV_UPLOADING, Set.of(CV_PARSED),
            CV_PARSED, Set.of(CONSENT_PENDING, JOINING),
            CONSENT_PENDING, Set.of(JOINING),
            JOINING, Set.of(LIVE),
            LIVE, Set.of(WRAP_UP, ENDED),
            WRAP_UP, Set.of(ENDED),
            ENDED, Set.of(SCORING),
            SCORING, Set.of(REPORT_READY)
    );

    public void transitionTo(Session session, SessionState newState) {
        SessionState currentState = session.getState();

        Set<SessionState> allowed = ALLOWED_TRANSITIONS.get(currentState);
        if (allowed == null || !allowed.contains(newState)) {
            throw BusinessException.badRequest(
                    String.format("Invalid state transition: %s → %s", currentState, newState)
            );
        }

        log.info("Session {} transitioning: {} → {}", session.getId(), currentState, newState);
        session.setState(newState);
    }
}
