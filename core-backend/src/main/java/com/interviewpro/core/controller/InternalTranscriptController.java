package com.interviewpro.core.controller;

import com.interviewpro.core.model.entity.Transcript;
import com.interviewpro.core.repository.TranscriptRepository;
import com.interviewpro.core.websocket.SessionEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/internal/transcripts")
@RequiredArgsConstructor
@Slf4j
public class InternalTranscriptController {

    private final TranscriptRepository transcriptRepository;
    private final SessionEventPublisher wsPublisher;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> saveTranscript(@RequestBody Map<String, Object> body) {
        UUID sessionId = UUID.fromString((String) body.get("sessionId"));
        int turnIndex = ((Number) body.get("turnIndex")).intValue();
        String speaker = (String) body.get("speaker");
        String text = (String) body.get("text");
        Long timestampMs = body.get("timestampMs") != null
                ? ((Number) body.get("timestampMs")).longValue()
                : null;

        Transcript transcript = Transcript.builder()
                .sessionId(sessionId)
                .turnIndex(turnIndex)
                .speaker(speaker)
                .text(text)
                .timestampMs(timestampMs)
                .isFinal(true)
                .build();

        transcriptRepository.save(transcript);
        log.info("Saved transcript turn {} for session {} (speaker={})", turnIndex, sessionId, speaker);

        // Broadcast transcript to connected WebSocket clients
        wsPublisher.publishTranscriptTurn(sessionId, speaker, text, turnIndex);

        return Map.of("status", "ok");
    }

    @GetMapping("/{sessionId}")
    public List<Transcript> getBySession(@PathVariable UUID sessionId) {
        return transcriptRepository.findBySessionIdOrderByTurnIndexAsc(sessionId);
    }
}
