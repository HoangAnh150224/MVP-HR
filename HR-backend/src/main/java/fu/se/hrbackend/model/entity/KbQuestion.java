package fu.se.hrbackend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "kb_questions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class KbQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "role_template_id")
    private UUID roleTemplateId;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 200)
    private String topic;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String difficulty = "mid";

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "follow_ups", columnDefinition = "jsonb")
    @Builder.Default
    private String followUps = "[]";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sample_answers", columnDefinition = "jsonb")
    @Builder.Default
    private String sampleAnswers = "{}";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "scoring_rubric", columnDefinition = "jsonb")
    @Builder.Default
    private String scoringRubric = "{}";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private String tags = "[]";

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String locale = "vi";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
