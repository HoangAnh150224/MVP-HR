package com.interviewpro.core.repository;

import com.interviewpro.core.model.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SessionRepository extends JpaRepository<Session, UUID> {
    List<Session> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
