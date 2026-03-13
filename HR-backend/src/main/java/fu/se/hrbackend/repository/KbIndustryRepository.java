package fu.se.hrbackend.repository;

import fu.se.hrbackend.model.entity.KbIndustry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface KbIndustryRepository extends JpaRepository<KbIndustry, UUID> {
    List<KbIndustry> findByIsActiveTrueOrderByNameAsc();
    Optional<KbIndustry> findBySlug(String slug);
}
