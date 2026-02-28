package fu.se.hrbackend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateSessionRequest {
    @NotBlank
    private String targetRole;
    private String difficulty = "mid";
    private String mode = "scored";
}
