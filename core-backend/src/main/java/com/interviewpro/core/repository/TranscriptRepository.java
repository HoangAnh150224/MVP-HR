package com.interviewpro.core.repository;

import com.interviewpro.core.model.entity.Transcript;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TranscriptRepository extends JpaRepository<Transcript, UUID> {
    List<Transcript> findBySessionIdOrderByTurnIndexAsc(UUID sessionId);
}
