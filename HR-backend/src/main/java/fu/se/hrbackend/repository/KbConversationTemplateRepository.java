package fu.se.hrbackend.repository;

import fu.se.hrbackend.model.entity.KbConversationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface KbConversationTemplateRepository extends JpaRepository<KbConversationTemplate, UUID> {
    List<KbConversationTemplate> findByIsActiveTrueOrderBySortOrderAsc();
    List<KbConversationTemplate> findByTypeAndLocaleAndIsActiveTrueOrderBySortOrderAsc(String type, String locale);
    List<KbConversationTemplate> findByTypeInAndLocaleAndIsActiveTrueOrderBySortOrderAsc(List<String> types, String locale);
}
