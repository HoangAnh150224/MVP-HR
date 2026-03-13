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
@Table(name = "kb_import_jobs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class KbImportJob {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "file_name", length = 500)
    private String fileName;

    @Column(name = "import_type", nullable = false, length = 50)
    private String importType;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "total_rows")
    @Builder.Default
    private Integer totalRows = 0;

    @Column(name = "success_count")
    @Builder.Default
    private Integer successCount = 0;

    @Column(name = "error_count")
    @Builder.Default
    private Integer errorCount = 0;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private String errors = "[]";

    @Column(name = "imported_by")
    private UUID importedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
