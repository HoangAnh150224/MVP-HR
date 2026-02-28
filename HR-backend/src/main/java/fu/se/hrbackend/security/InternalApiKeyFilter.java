package fu.se.hrbackend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class InternalApiKeyFilter extends OncePerRequestFilter {

    @Value("${app.internal-api-key:}")
    private String internalApiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Only check internal endpoints when API key is configured
        if (path.startsWith("/internal/") && internalApiKey != null && !internalApiKey.isBlank()) {
            String providedKey = request.getHeader("X-Internal-Api-Key");
            if (providedKey == null || !providedKey.equals(internalApiKey)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":{\"code\":\"UNAUTHORIZED\",\"message\":\"Invalid internal API key\"}}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
