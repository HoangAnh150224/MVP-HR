package fu.se.hrbackend.websocket;

import fu.se.hrbackend.model.enums.SessionState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class SessionEventPublisher {

    private final SessionWebSocketHandler webSocketHandler;

    public void publishStateChanged(UUID sessionId, SessionState oldState, SessionState newState) {
        webSocketHandler.sendEvent(sessionId, "session.state_changed", Map.of(
                "oldState", oldState.name(),
                "newState", newState.name()
        ));
    }

    public void publishTranscriptTurn(UUID sessionId, String speaker, String text, int turnIndex) {
        webSocketHandler.sendEvent(sessionId, "transcript.turn", Map.of(
                "speaker", speaker,
                "text", text,
                "turnIndex", turnIndex
        ));
    }

    public void publishReportReady(UUID sessionId, int overallScore) {
        webSocketHandler.sendEvent(sessionId, "report.ready", Map.of(
                "overallScore", overallScore
        ));
    }
}
