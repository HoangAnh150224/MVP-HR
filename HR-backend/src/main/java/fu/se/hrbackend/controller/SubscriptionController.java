package fu.se.hrbackend.controller;

import fu.se.hrbackend.exception.BusinessException;
import fu.se.hrbackend.model.entity.Subscription;
import fu.se.hrbackend.model.enums.SubscriptionTier;
import fu.se.hrbackend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/me")
    public Map<String, Object> getMySubscription(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return subscriptionService.getSubscriptionInfo(userId);
    }

    @PostMapping("/upgrade")
    public Map<String, Object> upgrade(@RequestBody Map<String, String> body, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        String tierStr = body.get("tier");
        if (tierStr == null) {
            throw BusinessException.badRequest("tier is required");
        }

        SubscriptionTier tier;
        try {
            tier = SubscriptionTier.valueOf(tierStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw BusinessException.badRequest("Invalid tier: " + tierStr);
        }

        if (tier == SubscriptionTier.FREE) {
            throw BusinessException.badRequest("Cannot upgrade to FREE tier");
        }

        Subscription sub = subscriptionService.upgrade(userId, tier);
        return Map.of(
                "status", "upgraded",
                "tier", sub.getTier().name(),
                "expiresAt", sub.getExpiresAt() != null ? sub.getExpiresAt().toString() : ""
        );
    }
}
