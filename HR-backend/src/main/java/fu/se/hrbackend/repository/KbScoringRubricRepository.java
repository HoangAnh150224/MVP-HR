package fu.se.hrbackend.repository;

import fu.se.hrbackend.model.entity.KbScoringRubric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface KbScoringRubricRepository extends JpaRepository<KbScoringRubric, UUID> {
    List<KbScoringRubric> findByIsActiveTrueOrderByWeightPercentDesc();
    Optional<KbScoringRubric> findBySlug(String slug);
}
