package com.interviewpro.core.repository;

import com.interviewpro.core.model.entity.CVProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CVProfileRepository extends JpaRepository<CVProfile, UUID> {
    Optional<CVProfile> findBySessionId(UUID sessionId);
}
