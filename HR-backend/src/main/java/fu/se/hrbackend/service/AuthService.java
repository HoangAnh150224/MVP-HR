package fu.se.hrbackend.service;

import fu.se.hrbackend.exception.BusinessException;
import fu.se.hrbackend.model.dto.AuthRequest;
import fu.se.hrbackend.model.dto.AuthResponse;
import fu.se.hrbackend.model.dto.RegisterRequest;
import fu.se.hrbackend.model.entity.User;
import fu.se.hrbackend.repository.UserRepository;
import fu.se.hrbackend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(HttpStatus.CONFLICT, "EMAIL_EXISTS", "Email already registered");
        }
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .build();
        user = userRepository.save(user);
        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId().toString(), user.getEmail(), user.getName(), user.getRole().name());
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> BusinessException.badRequest("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw BusinessException.badRequest("Invalid credentials");
        }
        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId().toString(), user.getEmail(), user.getName(), user.getRole().name());
    }
}
