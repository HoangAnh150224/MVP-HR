package fu.se.hrbackend.repository;

import fu.se.hrbackend.model.entity.KbRoleTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface KbRoleTemplateRepository extends JpaRepository<KbRoleTemplate, UUID> {
    List<KbRoleTemplate> findByIsActiveTrueOrderByNameAsc();
    Optional<KbRoleTemplate> findBySlug(String slug);
    List<KbRoleTemplate> findByIndustryIdAndIsActiveTrue(UUID industryId);

    @Query("SELECT r FROM KbRoleTemplate r WHERE r.isActive = true " +
           "AND LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<KbRoleTemplate> searchByName(@Param("keyword") String keyword);
}
