package fu.se.hrbackend.service;

import fu.se.hrbackend.exception.BusinessException;
import fu.se.hrbackend.model.entity.Session;
import fu.se.hrbackend.model.entity.Subscription;
import fu.se.hrbackend.model.enums.SubscriptionTier;
import fu.se.hrbackend.repository.SessionRepository;
import fu.se.hrbackend.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private static final int FREE_WEEKLY_LIMIT = 2;

    private final SubscriptionRepository subscriptionRepository;
    private final SessionRepository sessionRepository;

    public Subscription getActiveSubscription(UUID userId) {
        return subscriptionRepository.findByUserIdAndIsActiveTrue(userId).orElse(null);
    }

    public SubscriptionTier getCurrentTier(UUID userId) {
        Subscription sub = getActiveSubscription(userId);
        if (sub == null) return SubscriptionTier.FREE;
        // Check if expired
        if (sub.getExpiresAt() != null && sub.getExpiresAt().isBefore(OffsetDateTime.now())) {
            sub.setIsActive(false);
            subscriptionRepository.save(sub);
            return SubscriptionTier.FREE;
        }
        return sub.getTier();
    }

    public boolean canStartSession(UUID userId) {
        SubscriptionTier tier = getCurrentTier(userId);
        if (tier == SubscriptionTier.TRIAL_3D || tier == SubscriptionTier.MONTHLY) {
            return true; // Paid tiers have unlimited sessions
        }
        // FREE tier: 2 sessions per week
        OffsetDateTime weekAgo = OffsetDateTime.now().minusDays(7);
        List<Session> recentSessions = sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        long count = recentSessions.stream()
                .filter(s -> s.getCreatedAt().isAfter(weekAgo))
                .count();
        return count < FREE_WEEKLY_LIMIT;
    }

    public int getRemainingFreeSessions(UUID userId) {
        SubscriptionTier tier = getCurrentTier(userId);
        if (tier != SubscriptionTier.FREE) return -1; // unlimited
        OffsetDateTime weekAgo = OffsetDateTime.now().minusDays(7);
        List<Session> recentSessions = sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        long count = recentSessions.stream()
                .filter(s -> s.getCreatedAt().isAfter(weekAgo))
                .count();
        return Math.max(0, (int) (FREE_WEEKLY_LIMIT - count));
    }

    public Subscription upgrade(UUID userId, SubscriptionTier tier) {
        // Deactivate any existing subscription
        subscriptionRepository.findByUserIdAndIsActiveTrue(userId)
                .ifPresent(existing -> {
                    existing.setIsActive(false);
                    subscriptionRepository.save(existing);
                });

        OffsetDateTime expiresAt;
        if (tier == SubscriptionTier.TRIAL_3D) {
            expiresAt = OffsetDateTime.now().plusDays(3);
        } else if (tier == SubscriptionTier.MONTHLY) {
            expiresAt = OffsetDateTime.now().plusMonths(1);
        } else {
            expiresAt = null;
        }

        Subscription sub = Subscription.builder()
                .userId(userId)
                .tier(tier)
                .expiresAt(expiresAt)
                .build();

        return subscriptionRepository.save(sub);
    }

    public Map<String, Object> getSubscriptionInfo(UUID userId) {
        SubscriptionTier tier = getCurrentTier(userId);
        Subscription sub = getActiveSubscription(userId);

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("tier", tier.name());
        result.put("remaining", tier == SubscriptionTier.FREE ? getRemainingFreeSessions(userId) : -1);
        if (sub != null && sub.getExpiresAt() != null) {
            result.put("expiresAt", sub.getExpiresAt().toString());
        }
        return result;
    }
}
