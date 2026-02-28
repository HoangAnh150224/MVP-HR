# Skill: core-backend (Spring Boot API)

## Service Description
**Stack**: Spring Boot 3.3, Java 21, PostgreSQL, Redis, Flyway
**Port**: 8080
**Path**: `core-backend/`

The core-backend is the central REST API and WebSocket gateway. It manages users, sessions, CV uploads, coordinates with voice-agent-service for interview sessions, proxies calls to llm-orchestrator-service, and fans out real-time events to connected web-app clients.

## When to Use This Skill
- Creating or modifying REST controllers
- Defining JPA entities and repositories
- Writing Flyway database migrations
- Configuring Spring Security (JWT)
- WebSocket event broadcasting
- Interview session dispatch via voice-agent-service
- Service-to-service calls to llm-orchestrator-service
- Session state machine transitions

## Folder Structure
```
core-backend/src/main/java/com/interviewpro/core/
├── CoreApplication.java          # Spring Boot entry point
├── config/                       # Configuration classes
│   ├── SecurityConfig.java       # Spring Security + JWT
│   ├── WebSocketConfig.java      # WS endpoint registration
│   ├── LlmOrchestratorConfig.java # LLM orchestrator URL config
│   └── RedisConfig.java          # Redis template config
├── controller/                   # REST controllers
│   ├── AuthController.java       # POST /api/v1/auth/*
│   ├── SessionController.java    # CRUD /api/v1/sessions
│   ├── CVController.java         # POST /api/v1/cv-profiles
│   ├── ReportController.java     # GET /api/v1/reports
│   └── AdminController.java      # Admin-only endpoints
├── service/                      # Business logic
│   ├── AuthService.java
│   ├── SessionService.java       # State machine, lifecycle
│   ├── CVIngestService.java      # Upload → llm-orchestrator parse
│   ├── InterviewDispatchService.java # Dispatch voice agent session
│   ├── LLMOrchestratorClient.java # HTTP client to llm-orchestrator
│   ├── ReportService.java        # Fetch/store reports
│   └── EventFanoutService.java   # Broadcast events via WS
├── model/
│   ├── entity/                   # JPA entities
│   ├── dto/                      # Request/Response DTOs
│   └── enums/                    # SessionState, CVParseStatus, Role
├── repository/                   # Spring Data JPA repositories
├── websocket/                    # WS handlers
│   ├── EventWebSocketHandler.java
│   └── SessionEventEmitter.java
├── security/                     # JWT token provider & filter
│   ├── JwtTokenProvider.java
│   └── JwtAuthFilter.java
└── exception/                    # Global error handling
    ├── GlobalExceptionHandler.java
    └── BusinessException.java
```

## Conventions

### REST Controller Pattern
```java
@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    public ResponseEntity<SessionDTO> createSession(
            @Valid @RequestBody CreateSessionRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        SessionDTO session = sessionService.create(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionDTO> getSession(@PathVariable UUID id) {
        return ResponseEntity.ok(sessionService.getById(id));
    }
}
```

### Service Layer Pattern
```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SessionService {

    private final SessionRepository sessionRepository;
    private final EventFanoutService eventFanout;

    @Transactional
    public SessionDTO create(UUID userId, CreateSessionRequest request) {
        Session session = Session.builder()
            .userId(userId)
            .state(SessionState.CREATED)
            .build();
        session = sessionRepository.save(session);
        eventFanout.emit(session.getId(), "session.state_changed",
            Map.of("state", session.getState()));
        return SessionDTO.from(session);
    }
}
```

### Entity Pattern
```java
@Entity
@Table(name = "sessions")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionState state;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    void onCreate() { createdAt = Instant.now(); updatedAt = createdAt; }

    @PreUpdate
    void onUpdate() { updatedAt = Instant.now(); }
}
```

### DTO Pattern
```java
public record SessionDTO(
    UUID id,
    UUID userId,
    SessionState state,
    Instant createdAt
) {
    public static SessionDTO from(Session entity) {
        return new SessionDTO(
            entity.getId(),
            entity.getUserId(),
            entity.getState(),
            entity.getCreatedAt()
        );
    }
}
```

### Flyway Migration Naming
```
V1__create_users_table.sql
V2__create_sessions_table.sql
V3__create_cv_profiles_table.sql
V4__create_reports_table.sql
```

### WebSocket Event Emission
```java
@Service
@RequiredArgsConstructor
public class EventFanoutService {

    private final SimpMessagingTemplate messagingTemplate;

    public void emit(UUID sessionId, String type, Object payload) {
        EventDTO event = new EventDTO(type, sessionId, Instant.now(), payload);
        messagingTemplate.convertAndSend(
            "/topic/session/" + sessionId, event);
    }
}
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login, returns JWT |
| POST | /api/v1/sessions | Create interview session |
| GET | /api/v1/sessions | List user's sessions |
| GET | /api/v1/sessions/{id} | Get session details |
| PATCH | /api/v1/sessions/{id}/state | Transition session state |
| POST | /api/v1/cv-profiles | Upload & parse CV |
| GET | /api/v1/cv-profiles/{id} | Get parsed CV profile |
| POST | /api/v1/interview/start/{id} | Start interview session |
| GET | /api/v1/reports/{sessionId} | Get interview report |
| WS | /ws/events | Real-time event stream |

## Key Dependencies
```xml
<dependencies>
    <dependency>spring-boot-starter-web</dependency>
    <dependency>spring-boot-starter-data-jpa</dependency>
    <dependency>spring-boot-starter-security</dependency>
    <dependency>spring-boot-starter-websocket</dependency>
    <dependency>spring-boot-starter-validation</dependency>
    <dependency>spring-boot-starter-data-redis</dependency>
    <dependency>postgresql</dependency>
    <dependency>flyway-core</dependency>
    <dependency>jjwt-api</dependency>
    <dependency>lombok</dependency>
    <dependency>mapstruct (optional)</dependency>
</dependencies>
```

## Error Handling
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
        return ResponseEntity.status(ex.getStatus())
            .body(new ErrorResponse(ex.getCode(), ex.getMessage(), ex.getDetails()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage()).toList();
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", "Invalid request", details));
    }
}
```

## Testing
- Unit tests: JUnit 5 + Mockito for services
- Integration tests: @SpringBootTest with Testcontainers (PostgreSQL, Redis)
- Controller tests: @WebMvcTest with MockMvc
- Repository tests: @DataJpaTest
