package com.interviewpro.core.repository;

import com.interviewpro.core.model.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, UUID> {
    Optional<Report> findBySessionId(UUID sessionId);
}
