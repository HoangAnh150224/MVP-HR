package fu.se.hrbackend.repository;

import fu.se.hrbackend.model.entity.KbQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface KbQuestionRepository extends JpaRepository<KbQuestion, UUID> {

    List<KbQuestion> findByIsActiveTrueOrderByCreatedAtDesc();

    List<KbQuestion> findByCategoryAndIsActiveTrue(String category);

    List<KbQuestion> findByRoleTemplateIdAndIsActiveTrue(UUID roleTemplateId);

    @Query("SELECT q FROM KbQuestion q WHERE q.isActive = true " +
           "AND (:roleTemplateId IS NULL OR q.roleTemplateId = :roleTemplateId OR q.roleTemplateId IS NULL) " +
           "AND (:category IS NULL OR q.category = :category) " +
           "AND (:difficulty IS NULL OR q.difficulty = :difficulty) " +
           "ORDER BY CASE WHEN q.roleTemplateId = :roleTemplateId THEN 0 ELSE 1 END, q.createdAt DESC")
    List<KbQuestion> searchQuestions(
            @Param("roleTemplateId") UUID roleTemplateId,
            @Param("category") String category,
            @Param("difficulty") String difficulty);

    @Query("SELECT q FROM KbQuestion q WHERE q.isActive = true " +
           "AND LOWER(q.questionText) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<KbQuestion> searchByText(@Param("keyword") String keyword);

    long countByIsActiveTrue();
}
