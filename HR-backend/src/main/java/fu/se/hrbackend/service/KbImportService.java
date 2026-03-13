package fu.se.hrbackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import fu.se.hrbackend.model.entity.KbImportJob;
import fu.se.hrbackend.model.entity.KbQuestion;
import fu.se.hrbackend.model.entity.KbRoleTemplate;
import fu.se.hrbackend.repository.KbImportJobRepository;
import fu.se.hrbackend.repository.KbQuestionRepository;
import fu.se.hrbackend.repository.KbRoleTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class KbImportService {

    private final KbQuestionRepository questionRepository;
    private final KbRoleTemplateRepository roleTemplateRepository;
    private final KbImportJobRepository importJobRepository;
    private final ObjectMapper objectMapper;

    public KbImportJob startImport(MultipartFile file, String importType, UUID importedBy) {
        KbImportJob job = KbImportJob.builder()
                .fileName(file.getOriginalFilename())
                .importType(importType)
                .status("PROCESSING")
                .importedBy(importedBy)
                .build();
        job = importJobRepository.save(job);

        // Process async
        processImport(job.getId(), file, importType);

        return job;
    }

    @Async("scoringExecutor")
    public void processImport(UUID jobId, MultipartFile file, String importType) {
        KbImportJob job = importJobRepository.findById(jobId).orElse(null);
        if (job == null) return;

        try {
            String filename = file.getOriginalFilename();
            if (filename != null && (filename.endsWith(".xlsx") || filename.endsWith(".xls"))) {
                processExcel(job, file);
            } else if (filename != null && filename.endsWith(".csv")) {
                processCsv(job, file);
            } else {
                job.setStatus("FAILED");
                job.setErrors("[\"Unsupported file format. Use .xlsx or .csv\"]");
                importJobRepository.save(job);
                return;
            }

            job.setStatus("COMPLETED");
            importJobRepository.save(job);
            log.info("Import job {} completed: {} success, {} errors",
                    jobId, job.getSuccessCount(), job.getErrorCount());
        } catch (Exception e) {
            log.error("Import job {} failed: {}", jobId, e.getMessage());
            job.setStatus("FAILED");
            job.setErrors("[\"" + e.getMessage().replace("\"", "'") + "\"]");
            importJobRepository.save(job);
        }
    }

    private void processExcel(KbImportJob job, MultipartFile file) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            int totalRows = sheet.getLastRowNum(); // excluding header
            job.setTotalRows(totalRows);

            List<String> errors = new ArrayList<>();
            int successCount = 0;

            for (int i = 1; i <= totalRows; i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    importQuestionRow(row, i);
                    successCount++;
                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                }
            }

            job.setSuccessCount(successCount);
            job.setErrorCount(errors.size());
            job.setErrors(objectMapper.writeValueAsString(errors));
            importJobRepository.save(job);
        }
    }

    private void processCsv(KbImportJob job, MultipartFile file) throws Exception {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String header = reader.readLine(); // skip header
            if (header == null) return;

            List<String> errors = new ArrayList<>();
            int successCount = 0;
            int rowNum = 1;
            String line;

            while ((line = reader.readLine()) != null) {
                rowNum++;
                try {
                    String[] cols = parseCsvLine(line);
                    importQuestionFromCsvCols(cols, rowNum);
                    successCount++;
                } catch (Exception e) {
                    errors.add("Row " + rowNum + ": " + e.getMessage());
                }
            }

            job.setTotalRows(rowNum - 1);
            job.setSuccessCount(successCount);
            job.setErrorCount(errors.size());
            job.setErrors(objectMapper.writeValueAsString(errors));
            importJobRepository.save(job);
        }
    }

    private void importQuestionRow(Row row, int rowIndex) {
        // Columns: role_slug | level | category | topic | question_text | follow_up_1 |
        //          good_answer | good_score | medium_answer | medium_score |
        //          bad_answer | bad_score | tags | key_points | red_flags
        String roleSlug = getCellString(row, 0);
        String level = getCellString(row, 1);
        String category = getCellString(row, 2);
        String topic = getCellString(row, 3);
        String questionText = getCellString(row, 4);
        String followUp1 = getCellString(row, 5);
        String goodAnswer = getCellString(row, 6);
        int goodScore = getCellInt(row, 7, 8);
        String mediumAnswer = getCellString(row, 8);
        int mediumScore = getCellInt(row, 9, 5);
        String badAnswer = getCellString(row, 10);
        int badScore = getCellInt(row, 11, 2);
        String tags = getCellString(row, 12);
        String keyPoints = getCellString(row, 13);
        String redFlags = getCellString(row, 14);

        if (questionText == null || questionText.isBlank()) {
            throw new RuntimeException("question_text is required");
        }
        if (category == null || category.isBlank()) {
            throw new RuntimeException("category is required");
        }

        // Match role template
        UUID roleTemplateId = null;
        if (roleSlug != null && !roleSlug.isBlank()) {
            roleTemplateId = roleTemplateRepository.findBySlug(roleSlug)
                    .map(KbRoleTemplate::getId).orElse(null);
        }

        // Build sample answers JSON
        String sampleAnswers = buildSampleAnswersJson(
                goodAnswer, goodScore, mediumAnswer, mediumScore, badAnswer, badScore);

        // Build scoring rubric JSON
        String scoringRubric = buildScoringRubricJson(keyPoints, redFlags);

        // Build follow-ups JSON
        String followUps = "[]";
        if (followUp1 != null && !followUp1.isBlank()) {
            try {
                followUps = objectMapper.writeValueAsString(List.of(followUp1));
            } catch (Exception ignored) {}
        }

        // Build tags JSON
        String tagsJson = "[]";
        if (tags != null && !tags.isBlank()) {
            try {
                List<String> tagList = Arrays.stream(tags.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList();
                tagsJson = objectMapper.writeValueAsString(tagList);
            } catch (Exception ignored) {}
        }

        KbQuestion question = KbQuestion.builder()
                .roleTemplateId(roleTemplateId)
                .category(category.trim())
                .topic(topic)
                .difficulty(level != null && !level.isBlank() ? level.trim() : "mid")
                .questionText(questionText.trim())
                .followUps(followUps)
                .sampleAnswers(sampleAnswers)
                .scoringRubric(scoringRubric)
                .tags(tagsJson)
                .build();

        questionRepository.save(question);
    }

    private void importQuestionFromCsvCols(String[] cols, int rowNum) {
        if (cols.length < 5) {
            throw new RuntimeException("Not enough columns (need at least 5)");
        }

        String roleSlug = cols.length > 0 ? cols[0].trim() : "";
        String level = cols.length > 1 ? cols[1].trim() : "mid";
        String category = cols.length > 2 ? cols[2].trim() : "";
        String topic = cols.length > 3 ? cols[3].trim() : "";
        String questionText = cols.length > 4 ? cols[4].trim() : "";

        if (questionText.isBlank()) throw new RuntimeException("question_text is required");
        if (category.isBlank()) throw new RuntimeException("category is required");

        UUID roleTemplateId = null;
        if (!roleSlug.isBlank()) {
            roleTemplateId = roleTemplateRepository.findBySlug(roleSlug)
                    .map(KbRoleTemplate::getId).orElse(null);
        }

        String followUp1 = cols.length > 5 ? cols[5].trim() : "";
        String goodAnswer = cols.length > 6 ? cols[6].trim() : "";
        int goodScore = cols.length > 7 ? parseIntSafe(cols[7], 8) : 8;
        String mediumAnswer = cols.length > 8 ? cols[8].trim() : "";
        int mediumScore = cols.length > 9 ? parseIntSafe(cols[9], 5) : 5;
        String badAnswer = cols.length > 10 ? cols[10].trim() : "";
        int badScore = cols.length > 11 ? parseIntSafe(cols[11], 2) : 2;
        String tags = cols.length > 12 ? cols[12].trim() : "";
        String keyPoints = cols.length > 13 ? cols[13].trim() : "";
        String redFlags = cols.length > 14 ? cols[14].trim() : "";

        String sampleAnswers = buildSampleAnswersJson(
                goodAnswer, goodScore, mediumAnswer, mediumScore, badAnswer, badScore);
        String scoringRubric = buildScoringRubricJson(keyPoints, redFlags);

        String followUps = "[]";
        if (!followUp1.isBlank()) {
            try {
                followUps = objectMapper.writeValueAsString(List.of(followUp1));
            } catch (Exception ignored) {}
        }

        String tagsJson = "[]";
        if (!tags.isBlank()) {
            try {
                List<String> tagList = Arrays.stream(tags.split(","))
                        .map(String::trim).filter(s -> !s.isEmpty()).toList();
                tagsJson = objectMapper.writeValueAsString(tagList);
            } catch (Exception ignored) {}
        }

        KbQuestion question = KbQuestion.builder()
                .roleTemplateId(roleTemplateId)
                .category(category)
                .topic(topic.isEmpty() ? null : topic)
                .difficulty(level.isEmpty() ? "mid" : level)
                .questionText(questionText)
                .followUps(followUps)
                .sampleAnswers(sampleAnswers)
                .scoringRubric(scoringRubric)
                .tags(tagsJson)
                .build();

        questionRepository.save(question);
    }

    private String buildSampleAnswersJson(String good, int goodScore,
                                           String medium, int mediumScore,
                                           String bad, int badScore) {
        try {
            Map<String, Object> answers = new HashMap<>();
            if (good != null && !good.isBlank()) {
                answers.put("good", Map.of("text", good, "score", goodScore, "explanation", ""));
            }
            if (medium != null && !medium.isBlank()) {
                answers.put("medium", Map.of("text", medium, "score", mediumScore, "explanation", ""));
            }
            if (bad != null && !bad.isBlank()) {
                answers.put("bad", Map.of("text", bad, "score", badScore, "explanation", ""));
            }
            return objectMapper.writeValueAsString(answers);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String buildScoringRubricJson(String keyPoints, String redFlags) {
        try {
            Map<String, Object> rubric = new HashMap<>();
            if (keyPoints != null && !keyPoints.isBlank()) {
                rubric.put("keyPoints", Arrays.stream(keyPoints.split(","))
                        .map(String::trim).filter(s -> !s.isEmpty()).toList());
            }
            if (redFlags != null && !redFlags.isBlank()) {
                rubric.put("redFlags", Arrays.stream(redFlags.split(","))
                        .map(String::trim).filter(s -> !s.isEmpty()).toList());
            }
            return objectMapper.writeValueAsString(rubric);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((int) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
    }

    private int getCellInt(Row row, int col, int defaultValue) {
        Cell cell = row.getCell(col);
        if (cell == null) return defaultValue;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return (int) cell.getNumericCellValue();
            }
            return Integer.parseInt(cell.getStringCellValue().trim());
        } catch (Exception e) {
            return defaultValue;
        }
    }

    private int parseIntSafe(String value, int defaultValue) {
        try {
            return Integer.parseInt(value.trim());
        } catch (Exception e) {
            return defaultValue;
        }
    }

    private String[] parseCsvLine(String line) {
        // Simple CSV parsing (handles quoted fields)
        List<String> fields = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                fields.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        fields.add(current.toString());

        return fields.toArray(new String[0]);
    }
}
