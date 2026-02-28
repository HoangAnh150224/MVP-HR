package fu.se.hrbackend.repository;

import fu.se.hrbackend.model.entity.CVProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CVProfileRepository extends JpaRepository<CVProfile, UUID> {
    Optional<CVProfile> findBySessionId(UUID sessionId);
}
