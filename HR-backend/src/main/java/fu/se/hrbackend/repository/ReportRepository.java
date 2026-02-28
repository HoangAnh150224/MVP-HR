package fu.se.hrbackend.repository;

import fu.se.hrbackend.model.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, UUID> {
    Optional<Report> findBySessionId(UUID sessionId);
}
