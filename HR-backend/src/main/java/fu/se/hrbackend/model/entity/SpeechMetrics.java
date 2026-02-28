package fu.se.hrbackend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "speech_metrics")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SpeechMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "turn_index", nullable = false)
    private Integer turnIndex;

    @Column
    private Double wpm;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "filler_counts", columnDefinition = "jsonb")
    private String fillerCounts;

    @Column(name = "utterance_seconds")
    private Double utteranceSeconds;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
