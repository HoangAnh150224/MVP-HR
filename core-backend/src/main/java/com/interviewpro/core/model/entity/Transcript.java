package com.interviewpro.core.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "transcripts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Transcript {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "turn_index", nullable = false)
    private Integer turnIndex;

    @Column(nullable = false, length = 10)
    private String speaker;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "timestamp_ms")
    private Long timestampMs;

    @Column(name = "is_final")
    @Builder.Default
    private Boolean isFinal = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
