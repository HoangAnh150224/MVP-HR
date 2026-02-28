package fu.se.hrbackend.controller;

import fu.se.hrbackend.model.enums.SessionState;
import fu.se.hrbackend.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/internal/sessions")
@RequiredArgsConstructor
@Slf4j
public class InternalSessionStatusController {

    private final SessionService sessionService;

    @PostMapping("/{id}/status")
    public Map<String, String> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body
    ) {
        String stateStr = body.get("state");
        SessionState newState = SessionState.valueOf(stateStr);

        sessionService.transitionState(id, newState);
        log.info("Session {} status updated to {} (from voice-agent)", id, newState);

        return Map.of("status", "ok");
    }
}
