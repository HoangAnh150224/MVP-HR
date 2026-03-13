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
@Table(name = "kb_scoring_rubrics")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class KbScoringRubric {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "weight_percent", nullable = false)
    @Builder.Default
    private Integer weightPercent = 20;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "score_levels", columnDefinition = "jsonb")
    @Builder.Default
    private String scoreLevels = "{}";

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
