package fu.se.hrbackend.controller;

import fu.se.hrbackend.model.entity.SpeechMetrics;
import fu.se.hrbackend.repository.SpeechMetricsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/internal/speech-metrics")
@RequiredArgsConstructor
@Slf4j
public class InternalSpeechMetricsController {

    private final SpeechMetricsRepository speechMetricsRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> save(@RequestBody Map<String, Object> body) {
        String sessionId = (String) body.get("sessionId");
        Integer turnIndex = body.get("turnIndex") != null ? ((Number) body.get("turnIndex")).intValue() : 0;
        Double wpm = body.get("wpm") != null ? ((Number) body.get("wpm")).doubleValue() : null;
        String fillerCounts = body.get("fillerCounts") != null ? body.get("fillerCounts").toString() : "{}";
        Double utteranceSeconds = body.get("utteranceSeconds") != null ? ((Number) body.get("utteranceSeconds")).doubleValue() : null;

        SpeechMetrics metrics = SpeechMetrics.builder()
                .sessionId(UUID.fromString(sessionId))
                .turnIndex(turnIndex)
                .wpm(wpm)
                .fillerCounts(fillerCounts)
                .utteranceSeconds(utteranceSeconds)
                .build();
        speechMetricsRepository.save(metrics);

        log.debug("Saved speech metrics for session {} turn {}: wpm={}", sessionId, turnIndex, wpm);
        return Map.of("status", "saved");
    }
}
