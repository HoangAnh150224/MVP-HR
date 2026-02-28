package fu.se.hrbackend.repository;

import fu.se.hrbackend.model.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Optional<Subscription> findByUserIdAndIsActiveTrue(UUID userId);
}
