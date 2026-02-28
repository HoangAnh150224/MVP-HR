# Phase 6: Production Readiness — Chi tiết

> Goal: Hệ thống ổn định, bảo mật, sẵn sàng phục vụ 500+ users (B2C) + pilot doanh nghiệp (B2B)
> Phase này chạy song song với Phase 3-5, không blocking.

---

## 6.1 — Security Hardening

### Nghiệp vụ

**Sinh viên (B2C)**:
- CORS config từ env vars, không hardcode localhost
- Rate limiting: bảo vệ khỏi abuse, giữ hệ thống ổn định
- Input sanitization: prevent prompt injection qua CV text (gửi tới Gemini)
- JWT refresh token mechanism: user không bị logout đột ngột
- Logout: token blacklist trong Redis

**Doanh nghiệp (B2B — future)**:
- **Multi-tenant data isolation**: Dữ liệu ứng viên của org A KHÔNG THỂ truy cập bởi org B
- **Org-level permissions**: HR chỉ xem ứng viên của tổ chức mình
- Row-level security trên positions, invitations, sessions (qua organization_id)
- API endpoints phải check `org_member.organization_id` trước khi trả data

### Implementation

**CORS**:
```yaml
# application.yml
cors:
  allowed-origins: ${CORS_ORIGINS:http://localhost:3000}
```

**Rate limiting** (Redis-based):
- Public endpoints: 100 req/min per IP
- Auth endpoints: 10 req/min per IP (brute force protection)
- B2B API: rate limit per org (higher limit cho paid tiers)

**Input sanitization**:
- Strip HTML/script tags từ CV text trước khi gửi Gemini
- Validate file types (PDF/DOCX/TXT only)
- Max file size: 5MB

**JWT Refresh Token**:
- Access token: 15 min
- Refresh token: 7 days, stored in httpOnly cookie
- Logout: add access token to Redis blacklist (TTL = token expiry)

**Multi-tenant isolation** (B2B):
```java
// Every HR API endpoint must verify org membership
@PreAuthorize("@orgSecurity.isMember(authentication, #orgId)")
public ResponseEntity<?> getPositions(@PathVariable UUID orgId) { ... }

// Session queries for HR must filter by organization
SELECT s.* FROM sessions s
JOIN invitations i ON s.id = i.session_id
JOIN positions p ON i.position_id = p.id
WHERE p.organization_id = :orgId
```

### Files cần tạo/sửa

**core-backend**:
- Sửa `SecurityConfig.java` — CORS từ env, rate limiting filter
- File mới: `RateLimitFilter.java` — Redis-based rate limiting
- File mới: `JwtRefreshController.java` — Refresh token endpoint
- Sửa `JwtService.java` — Thêm refresh token generation + validation
- File mới: `OrgSecurityService.java` — Multi-tenant permission checks (B2B)
- File mới: `InputSanitizer.java` — Strip HTML, validate uploads

---

## 6.2 — Internal Service Auth

### Nghiệp vụ

**Tất cả services**:
- Mọi /internal/ endpoint phải có API key auth
- Prevent unauthorized access giữa services

**Doanh nghiệp (B2B — future)**:
- Org API keys cho B2B integrations (Enterprise tier)
- External systems gọi InterviewPro API bằng org-scoped API key
- API key có rate limit + scope (read-only, full access)

### Implementation

**Internal auth** (tất cả services):
```
Env var: INTERNAL_API_KEY=<shared-secret>
Header: X-Internal-Key: <key>

Middleware check trên mọi /internal/* routes
```

**B2B API keys** (future, Enterprise tier):
```sql
-- Thêm vào organizations hoặc tạo bảng riêng
CREATE TABLE org_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    key_hash VARCHAR(255) NOT NULL,       -- bcrypt hash of API key
    name VARCHAR(100),                     -- "Production key"
    scope VARCHAR(50) DEFAULT 'read',     -- read, full
    rate_limit_per_min INTEGER DEFAULT 100,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ
);
```

### Files cần tạo/sửa

**core-backend**:
- File mới: `InternalAuthFilter.java` — Check X-Internal-Key header
- Apply filter to all `/internal/**` endpoints

**voice-agent-service**:
- File mới: `src/middleware/internalAuth.ts` — Same check

**llm-orchestrator-service**:
- File mới: `src/middleware/internalAuth.ts` — Same check

**vision-analytics-service**:
- File mới: `app/middleware/internal_auth.py` — Same check

---

## 6.3 — Error Handling + Resilience

### Nghiệp vụ

**Sinh viên (B2C)**:
- Graceful degradation: nếu 1 service down → phỏng vấn vẫn tiếp tục được
- User-friendly error messages: "Đang gặp sự cố, vui lòng thử lại" (không show stack trace)
- Circuit breaker cho LLM calls (Gemini có thể chậm/down)

**Doanh nghiệp (B2B — future)**:
- SLA requirements: Standard tier → 99% uptime, Enterprise → 99.9%
- Error tracking per org: "Org X có bao nhiêu failed sessions?"
- Auto-notify HR khi ứng viên gặp lỗi kỹ thuật (session failed)
- Retry failed scoring: nếu scoring fail → queue retry → notify HR khi ready

### Implementation

**Circuit breaker** (core-backend → llm-orchestrator):
```java
@CircuitBreaker(name = "llmOrchestrator", fallbackMethod = "fallbackScoring")
public ScoringResult scoreTurn(ScoringRequest request) {
    return llmOrchestratorClient.scoreTurn(request);
}

// Fallback: queue for retry, notify user later
public ScoringResult fallbackScoring(ScoringRequest request, Exception e) {
    queueForRetry(request);
    return ScoringResult.pending("Đang chờ xử lý...");
}
```

**Graceful degradation**:

| Service down | Impact | Fallback |
|-------------|--------|----------|
| vision-analytics | Không phân tích body language | Interview tiếp tục, skip vision metrics trong report |
| llm-orchestrator | Không scoring | Queue report generation, notify user khi ready |
| Redis | Không cache, không rate limit | Fallback in-memory cache, skip rate limit |

**Structured error logging**:
```json
{
  "timestamp": "2026-02-27T10:30:00Z",
  "level": "ERROR",
  "service": "core-backend",
  "correlationId": "abc-123",
  "sessionId": "session-456",
  "userId": "user-789",
  "organizationId": "org-101",
  "message": "Failed to score turn",
  "error": "Connection timeout to llm-orchestrator"
}
```

### Files cần tạo/sửa

**core-backend**:
- Sửa `ReportGenerationService.java` — Circuit breaker + fallback
- File mới: `GlobalExceptionHandler.java` — Consistent error responses
- File mới: `RetryQueueService.java` — Queue failed operations for retry
- Thêm Resilience4j dependency nếu chưa có

**voice-agent-service**:
- Sửa `src/geminiClient.ts` — Auto-reconnect (Phase 3.4) + structured error logging

---

## 6.4 — Testing

### Nghiệp vụ

**Sinh viên (B2C)**:
- Test critical paths: auth → create session → interview → report
- Ensure report data integrity: scoring outputs match expected schema

**Doanh nghiệp (B2B — future)**:
- Test B2B flows: HR register → create position → invite → UV interview → HR view report
- Test multi-tenant isolation: org A data NOT accessible by org B
- Test permission boundaries: HR of org A cannot see org B positions

### Priority: test critical paths only

**core-backend**:
- Unit tests:
  - `SessionStateMachineTest.java` — All valid/invalid transitions
  - `ReportGenerationServiceTest.java` — Scoring orchestration
  - `SubscriptionServiceTest.java` — Tier enforcement, session limits
  - `OrgSecurityServiceTest.java` — Multi-tenant isolation (B2B)
- Integration tests:
  - Auth flow: register → login → JWT
  - Session CRUD: create → upload CV → start → end
  - B2B flow: create org → create position → invite → create session from invite

**web-app**:
- Component tests:
  - `ReportPage.test.tsx` — Renders all sections correctly
  - `TranscriptPanel.test.tsx` — Auto-scroll, partial text
  - `ConsentPage.test.tsx` — Checkbox validation
- E2E (Playwright):
  - B2C: Login → Create session → (mock) Interview → View report
  - B2B: HR login → Create position → Copy invite link → (mock) UV interview → HR view report

**llm-orchestrator-service**:
- Unit tests: Schema validation, route handlers (mock Gemini responses)

**voice-agent-service**:
- Unit tests: Audio encoding/decoding, transcript parsing, reconnect logic

### Files cần tạo/sửa

**core-backend**:
- File mới: `test/` folder với unit + integration tests cho critical paths
- Focus: state machine, scoring, subscription, org security

**web-app**:
- File mới: `__tests__/` hoặc co-located `.test.tsx` files
- File mới: `e2e/` folder cho Playwright tests

---

## 6.5 — Monitoring

### Nghiệp vụ

**Sinh viên (B2C)**:
- Health endpoints: biết service nào đang hoạt động
- Structured logging: JSON format, include sessionId + userId
- Docker compose health checks: auto-restart nếu service crash

**Doanh nghiệp (B2B — future)**:
- **Per-org usage tracking**: bao nhiêu UV đã phỏng vấn, bao nhiêu sessions/tháng
- **Billing metrics**: track usage để tính phí (Standard/Enterprise tiers)
- **Org health dashboard** (internal admin): xem usage per org
- Alert khi org sắp hết quota (80% max_candidates_per_month)

### Implementation

**Health endpoints**:

| Service | Endpoint | Checks |
|---------|----------|--------|
| core-backend | /actuator/health | DB, Redis, downstream services |
| voice-agent-service | /health | Gemini API reachable |
| llm-orchestrator | /health | Gemini API reachable |
| vision-analytics | /health | Model loaded |

**Structured logging** (all services):
```json
{
  "timestamp": "ISO-8601",
  "level": "INFO|WARN|ERROR",
  "service": "service-name",
  "sessionId": "uuid",
  "userId": "uuid",
  "organizationId": "uuid",     // B2B
  "correlationId": "uuid",      // Cross-service tracking
  "message": "...",
  "duration_ms": 123            // For performance tracking
}
```

**Per-org usage tracking** (B2B, internal query):
```sql
-- Usage per org per month
SELECT o.name, COUNT(s.id) as total_sessions,
       COUNT(CASE WHEN s.status = 'REPORT_READY' THEN 1 END) as completed,
       o.max_candidates_per_month as quota
FROM organizations o
JOIN positions p ON o.id = p.organization_id
JOIN invitations i ON p.id = i.position_id
JOIN sessions s ON i.session_id = s.id
WHERE s.created_at >= date_trunc('month', NOW())
GROUP BY o.id;
```

### Files cần tạo/sửa

**core-backend**:
- Sửa `application.yml` — Enable actuator health endpoint
- File mới: `UsageTrackingService.java` — Per-org usage aggregation (B2B)
- Structured logging: configure logback JSON format

**voice-agent-service / llm-orchestrator**:
- File mới: `src/routes/health.ts` — Health endpoint

**vision-analytics-service**:
- File mới: `app/routes/health.py` — Health endpoint

**docker-compose.yml**:
- Thêm health checks cho mỗi service

---

## 6.6 — API Documentation

### Nghiệp vụ

**Sinh viên (B2C)**:
- Swagger/OpenAPI cho core-backend: developer-friendly API docs
- WebSocket protocol doc (đã có trong CLAUDE.md)

**Doanh nghiệp (B2B — future)**:
- **B2B Integration Guide**: Hướng dẫn tích hợp cho Enterprise tier
- **Webhook docs**: Events mà B2B partner có thể subscribe (session.completed, report.ready)
- **API key management docs**: Cách tạo, rotate, revoke API keys
- Public API docs cho B2B partners (subset of internal API)

### Implementation

**Swagger/OpenAPI** (core-backend):
- Dependency: `springdoc-openapi-starter-webmvc-ui`
- Auto-generate từ annotations
- Group APIs: Public (B2C), HR (B2B), Internal (service-to-service)

**B2B Integration docs** (future):
```
/docs/api/
├── getting-started.md     — API key setup, authentication
├── positions.md           — Create/manage positions
├── invitations.md         — Generate invite links
├── reports.md             — Retrieve candidate reports
├── webhooks.md            — Event subscriptions
└── changelog.md           — API version history
```

**Webhook events** (B2B, Enterprise tier):
| Event | Trigger | Payload |
|-------|---------|---------|
| `session.completed` | Ứng viên hoàn thành phỏng vấn | {sessionId, candidateName, positionId} |
| `report.ready` | Report tạo xong | {sessionId, reportId, overallScore} |
| `invitation.expired` | Invite link hết hạn | {invitationId, candidateEmail} |

### Files cần tạo/sửa

**core-backend**:
- Thêm dependency `springdoc-openapi-starter-webmvc-ui` trong `pom.xml`
- Thêm OpenAPI annotations vào controllers
- Config swagger groups: public, hr, internal

**Mỗi service**:
- README.md per service với setup instructions (nếu chưa có)

---

## Thứ tự thực hiện Phase 6

```
Phase 6 chạy SONG SONG với Phase 3-5

6.1 Security hardening    — ưu tiên cao (CORS, rate limit, JWT refresh)
6.2 Internal auth         — ưu tiên cao (bảo vệ internal endpoints)
    |
    +-> 6.3 Error handling    — sau khi có auth
    +-> 6.4 Testing           — song song, continuous
    +-> 6.5 Monitoring        — song song
    +-> 6.6 API docs          — song song, có thể làm sớm

B2B additions (multi-tenant, org tracking, integration docs):
→ Làm khi bắt đầu develop B2B features (Phase 4.6+)
```
