package fu.se.hrbackend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.llm-orchestrator")
@Getter @Setter
public class LlmOrchestratorConfig {
    private String url;
}
