package fu.se.hrbackend.repository;

import fu.se.hrbackend.model.entity.SpeechMetrics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpeechMetricsRepository extends JpaRepository<SpeechMetrics, UUID> {
    List<SpeechMetrics> findBySessionIdOrderByTurnIndexAsc(UUID sessionId);
}
