package fu.se.hrbackend.repository;

import fu.se.hrbackend.model.entity.KbImportJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface KbImportJobRepository extends JpaRepository<KbImportJob, UUID> {
    List<KbImportJob> findByImportedByOrderByCreatedAtDesc(UUID importedBy);
}
