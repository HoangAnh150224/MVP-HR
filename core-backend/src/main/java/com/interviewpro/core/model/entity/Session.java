package com.interviewpro.core.model.entity;

import com.interviewpro.core.model.enums.SessionState;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sessions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SessionState state = SessionState.CREATED;

    @Column(name = "target_role")
    private String targetRole;

    @Column
    @Builder.Default
    private String difficulty = "mid";

    @Column
    @Builder.Default
    private String mode = "scored";

    @Column(name = "voice_agent_session_id")
    private String voiceAgentSessionId;

    @Column(name = "cv_profile_id")
    private UUID cvProfileId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "question_plan", columnDefinition = "jsonb")
    private String questionPlan;

    @Column(name = "consent_given_at")
    private OffsetDateTime consentGivenAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
