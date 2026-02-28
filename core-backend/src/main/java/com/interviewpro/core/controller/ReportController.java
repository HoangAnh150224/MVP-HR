package com.interviewpro.core.controller;

import com.interviewpro.core.model.entity.Report;
import com.interviewpro.core.repository.ReportRepository;
import com.interviewpro.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportRepository reportRepository;

    @GetMapping("/session/{sessionId}")
    public Report getBySession(@PathVariable UUID sessionId) {
        return reportRepository.findBySessionId(sessionId)
                .orElseThrow(() -> BusinessException.notFound("Report not found"));
    }
}
