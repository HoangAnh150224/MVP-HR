package fu.se.hrbackend.controller;

import fu.se.hrbackend.model.entity.CVProfile;
import fu.se.hrbackend.service.CVService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cv-profiles")
@RequiredArgsConstructor
public class CVController {

    private final CVService cvService;

    @PostMapping("/upload")
    public Map<String, Object> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("sessionId") UUID sessionId,
            Authentication auth
    ) {
        UUID userId = (UUID) auth.getPrincipal();
        CVProfile profile = cvService.uploadAndParse(userId, sessionId, file);

        return Map.of(
                "cvProfileId", profile.getId(),
                "status", profile.getParseStatus().name(),
                "filename", profile.getOriginalFilename()
        );
    }
}
