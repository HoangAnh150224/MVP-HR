package fu.se.hrbackend.controller;

import fu.se.hrbackend.exception.BusinessException;
import fu.se.hrbackend.model.entity.User;
import fu.se.hrbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public Map<String, Object> getMe(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("User not found"));
        return Map.of(
                "id", user.getId().toString(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().name(),
                "createdAt", user.getCreatedAt().toString()
        );
    }

    @PatchMapping("/me")
    public Map<String, Object> updateMe(@RequestBody Map<String, String> body, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("User not found"));

        if (body.containsKey("name") && body.get("name") != null) {
            user.setName(body.get("name").trim());
        }

        user = userRepository.save(user);
        return Map.of(
                "id", user.getId().toString(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().name()
        );
    }

    @PostMapping("/me/change-password")
    public Map<String, String> changePassword(@RequestBody Map<String, String> body, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("User not found"));

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            throw BusinessException.badRequest("currentPassword and newPassword are required");
        }
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw BusinessException.badRequest("Current password is incorrect");
        }
        if (newPassword.length() < 6) {
            throw BusinessException.badRequest("New password must be at least 6 characters");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return Map.of("status", "password_changed");
    }
}
