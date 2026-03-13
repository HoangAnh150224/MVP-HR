package fu.se.hrbackend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "kb_conversation_templates")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class KbConversationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "template_text", nullable = false, columnDefinition = "TEXT")
    private String templateText;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String locale = "vi";

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

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
