package fu.se.hrbackend.service;

import fu.se.hrbackend.model.enums.SessionState;
import fu.se.hrbackend.websocket.SessionEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SessionEventListener {

    private final ReportGenerationService reportGenerationService;
    private final SessionEventPublisher wsPublisher;

    @EventListener
    public void onSessionStateChanged(SessionService.SessionStateChangedEvent event) {
        log.debug("Session {} state changed: {} → {}", event.sessionId(), event.oldState(), event.newState());

        // Broadcast state change via WebSocket
        wsPublisher.publishStateChanged(event.sessionId(), event.oldState(), event.newState());

        // Trigger report generation when session ends
        if (event.newState() == SessionState.ENDED) {
            log.info("Session {} ended, triggering async report generation", event.sessionId());
            reportGenerationService.generateReport(event.sessionId());
        }
    }
}
