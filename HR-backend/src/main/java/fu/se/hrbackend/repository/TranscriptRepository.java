package fu.se.hrbackend.repository;

import fu.se.hrbackend.model.entity.Transcript;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TranscriptRepository extends JpaRepository<Transcript, UUID> {
    List<Transcript> findBySessionIdOrderByTurnIndexAsc(UUID sessionId);
}
