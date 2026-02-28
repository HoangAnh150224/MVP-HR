package fu.se.hrbackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import fu.se.hrbackend.config.LlmOrchestratorConfig;
import fu.se.hrbackend.exception.BusinessException;
import fu.se.hrbackend.model.entity.CVProfile;
import fu.se.hrbackend.model.entity.Session;
import fu.se.hrbackend.model.enums.CVParseStatus;
import fu.se.hrbackend.model.enums.SessionState;
import fu.se.hrbackend.repository.CVProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CVService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
    );
    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5MB

    private final CVProfileRepository cvProfileRepository;
    private final SessionService sessionService;
    private final LlmOrchestratorConfig llmConfig;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${app.internal-api-key:}")
    private String internalApiKey;

    public CVProfile uploadAndParse(UUID userId, UUID sessionId, MultipartFile file) {
        Session session = sessionService.getById(sessionId);
        if (!session.getUserId().equals(userId)) {
            throw BusinessException.forbidden("Not your session");
        }

        validateFile(file);

        // Extract text from file
        String cvText = extractText(file);
        if (cvText.isBlank()) {
            throw BusinessException.badRequest("Could not extract text from file");
        }

        // Create CVProfile
        CVProfile cvProfile = CVProfile.builder()
                .userId(userId)
                .sessionId(sessionId)
                .originalFilename(file.getOriginalFilename())
                .parseStatus(CVParseStatus.PARSING)
                .build();
        cvProfile = cvProfileRepository.save(cvProfile);

        try {
            // Call LLM orchestrator to parse CV
            String profileJson = callLlmParseCV(cvText, session.getTargetRole());
            cvProfile.setProfileData(profileJson);
            cvProfile.setParseStatus(CVParseStatus.PARSED);
            cvProfile = cvProfileRepository.save(cvProfile);
            log.info("CV parsed successfully for session {}", sessionId);

            // Generate question plan
            String questionPlanJson = callLlmGenerateQuestions(
                    profileJson, session.getTargetRole(), session.getDifficulty()
            );

            // Update session with CV data and transition state
            session.setCvProfileId(cvProfile.getId());
            session.setQuestionPlan(questionPlanJson);
            sessionService.save(session);
            sessionService.transitionState(sessionId, SessionState.CV_PARSED);
            log.info("Question plan generated for session {}", sessionId);

            return cvProfile;
        } catch (Exception e) {
            cvProfile.setParseStatus(CVParseStatus.FAILED);
            cvProfileRepository.save(cvProfile);
            log.error("CV processing failed for session {}: {}", sessionId, e.getMessage());
            throw BusinessException.badRequest("Failed to process CV: " + e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw BusinessException.badRequest("File is empty");
        }
        if (file.getSize() > MAX_SIZE) {
            throw BusinessException.badRequest("File size exceeds 5MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw BusinessException.badRequest("Unsupported file type. Allowed: PDF, DOCX, TXT");
        }
    }

    private String extractText(MultipartFile file) {
        String contentType = file.getContentType();
        try {
            if ("application/pdf".equals(contentType)) {
                return extractPdfText(file);
            } else if ("application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(contentType)) {
                return extractDocxText(file);
            } else {
                return new String(file.getBytes(), StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            throw BusinessException.badRequest("Failed to read file: " + e.getMessage());
        }
    }

    private String extractPdfText(MultipartFile file) throws IOException {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    private String extractDocxText(MultipartFile file) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(file.getInputStream())) {
            return doc.getParagraphs().stream()
                    .map(XWPFParagraph::getText)
                    .collect(Collectors.joining("\n"));
        }
    }

    private String callLlmParseCV(String cvText, String targetRole) {
        String url = llmConfig.getUrl() + "/internal/cv-profiles/parse";
        Map<String, String> body = Map.of("cvText", cvText, "targetRole", targetRole);
        return callLlm(url, body);
    }

    private String callLlmGenerateQuestions(String cvProfileJson, String targetRole, String difficulty) {
        String url = llmConfig.getUrl() + "/internal/question-plans/generate";
        try {
            Object cvProfile = objectMapper.readValue(cvProfileJson, Object.class);
            Map<String, Object> body = Map.of(
                    "cvProfile", cvProfile,
                    "targetRole", targetRole,
                    "difficulty", difficulty != null ? difficulty : "mid"
            );
            return callLlm(url, body);
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse CV profile JSON", e);
        }
    }

    private String callLlm(String url, Object body) {
        try {
            String json = objectMapper.writeValueAsString(body);
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .timeout(java.time.Duration.ofSeconds(120))
                    .POST(HttpRequest.BodyPublishers.ofString(json));

            if (internalApiKey != null && !internalApiKey.isBlank()) {
                builder.header("X-Internal-Api-Key", internalApiKey);
            }

            HttpRequest request = builder.build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                throw new RuntimeException("LLM orchestrator returned " + response.statusCode() + ": " + response.body());
            }

            return response.body();
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Failed to call LLM orchestrator: " + e.getMessage(), e);
        }
    }
}
