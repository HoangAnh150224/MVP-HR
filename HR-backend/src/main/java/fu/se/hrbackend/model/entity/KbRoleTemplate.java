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
@Table(name = "kb_role_templates")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class KbRoleTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "industry_id")
    private UUID industryId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 200)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "typical_skills", columnDefinition = "jsonb")
    @Builder.Default
    private String typicalSkills = "[]";

    @Column(name = "typical_jd", columnDefinition = "TEXT")
    private String typicalJd;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String difficulty = "mid";

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
