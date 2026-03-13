# Phase 1: E2E Flow — Nối vòng lặp chính

> BLOCKING cho mọi thứ khác. Không có Phase 1 = không có sản phẩm.

---

## 1.1 — Lưu trữ Transcript

### Nghiệp vụ

**Sinh viên (B2C)**:
- Khi phỏng vấn, mỗi lượt hỏi-đáp (AI hỏi → user trả lời) được ghi lại dạng text
- Transcript dùng để: chấm điểm từng câu, hiển thị trong report, xem lại sau
- User xem được transcript trong report và trong trang chi tiết session

**Doanh nghiệp (B2B — future)**:
- HR xem được transcript đầy đủ của ứng viên kèm metrics từng câu
- HR đọc để đánh giá chất lượng câu trả lời trước khi mời vòng 2

### Luồng kỹ thuật

```
voice-agent-service                    core-backend                   PostgreSQL
       │                                    │                              │
       │  Gemini trả transcript (isFinal)   │                              │
       │──── POST /internal/sessions/       │                              │
       │     {id}/transcripts               │                              │
       │     {turnIndex, speaker, text,     │  Validate session exists     │
       │      startTimeMs, endTimeMs,       │  Save Transcript entity      │
       │      isFinal, metrics}             │─────────────────────────────→│
       │                                    │                              │
       │     {id, status: "saved"}          │                              │
       │←───────────────────────────────────│                              │
```

### Database

```sql
-- V7__create_transcripts_table.sql
CREATE TABLE transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id),
    turn_index INTEGER NOT NULL,
    speaker VARCHAR(20) NOT NULL,        -- 'candidate' | 'agent'
    text TEXT NOT NULL,
    start_time_ms BIGINT,
    end_time_ms BIGINT,
    is_final BOOLEAN DEFAULT true,
    metrics JSONB,                        -- {wpm, fillerWords, fillerWordCount, silenceDurationMs}
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(session_id, turn_index, speaker)
);
CREATE INDEX idx_transcripts_session ON transcripts(session_id);
```

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | /internal/sessions/{id}/transcripts | Internal API key | {turnIndex, speaker, text, startTimeMs, endTimeMs, isFinal, metrics} | {id, status: "saved"} |
| GET | /api/v1/sessions/{id}/transcripts | Bearer token | — | TranscriptTurn[] ordered by turnIndex |

### Files cần tạo/sửa

**core-backend**:
- `Transcript.java` — Entity
- `TranscriptRepository.java` — findBySessionIdOrderByTurnIndex
- `TranscriptController.java` — POST internal + GET public
- `V7__create_transcripts_table.sql`

**voice-agent-service**:
- Sửa `agent.ts` — Khi isFinal transcript → HTTP POST tới core-backend
- Track turnIndex (increment mỗi lượt hỏi-đáp)

---

## 1.2 — Session State Machine

### Nghiệp vụ

**Sinh viên (B2C)**:
- Session đi qua các trạng thái rõ ràng, user biết mình đang ở đâu
- Không thể quay lại trạng thái trước (VD: ENDED → LIVE không hợp lệ)
- Khi interview kết thúc → tự động trigger chấm điểm

**Doanh nghiệp (B2B — future)**:
- HR thấy trạng thái session của ứng viên: "Đang phỏng vấn", "Có báo cáo"
- HR biết ứng viên nào đã hoàn thành, ứng viên nào đang chờ

### Trạng thái hợp lệ

```
CREATED ──upload CV──→ CV_UPLOADING ──parse OK──→ CV_PARSED
                            │
                            └──parse fail──→ CREATED (retry)

CV_PARSED ──consent──→ CONSENT_PENDING ──đồng ý──→ JOINING

CREATED/CV_PARSED ──start (skip CV)──→ JOINING

JOINING ──voice-agent connected──→ LIVE

LIVE ──user kết thúc / AI kết thúc──→ WRAP_UP ──→ ENDED

ENDED ──tự động──→ SCORING ──report xong──→ REPORT_READY
```

### Transitions KHÔNG hợp lệ (phải reject)
- ENDED → LIVE (không restart)
- REPORT_READY → bất kỳ state nào
- SCORING → ENDED (không cancel scoring)
- CREATED → LIVE (phải qua JOINING)

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | /internal/sessions/{id}/status | Internal API key | {status: "live" \| "ended"} | {status: "ok"} |

### Files cần tạo/sửa

**core-backend**:
- `SessionStateMachine.java` — Validate transitions
- Sửa `SessionService.java` — Dùng state machine cho mọi state changes

**voice-agent-service**:
- Sửa `agent.ts` — Gemini connected → POST status=live
- Sửa `agent.ts` — Interview end → POST status=ended

---

## 1.3 — Chấm điểm + Tạo Report

### Nghiệp vụ

**Sinh viên (B2C)**:
- Khi phỏng vấn kết thúc (ENDED), hệ thống TỰ ĐỘNG chấm điểm
- Chấm từng câu: điểm 0-10, feedback cụ thể, phân tích STAR (S/T/A/R có/không)
- Tổng hợp report cuối: điểm tổng 0-100, điểm theo tiêu chí, top 3 ưu tiên sửa
- User KHÔNG phải làm gì — chờ 30-60 giây, report tự xuất hiện

**Doanh nghiệp (B2B — future)**:
- Report ứng viên tự động gửi về HR dashboard
- HR xem điểm + transcript + so sánh với ứng viên khác
- Report kèm disclaimer: "Đánh giá AI, chỉ mang tính tham khảo"

### Luồng chấm điểm

```
Session = ENDED
  │
  ├→ Session → SCORING
  │
  ├→ Lấy transcripts từ DB
  │
  ├→ Ghép thành cặp: (AI question + candidate answer)
  │
  ├→ Cho mỗi cặp:
  │     POST llm-orchestrator/internal/scoring/turn
  │     {question, answer, category, difficulty}
  │     → {score: 0-10, feedback, confidenceScore, starComponents, sampleAnswer}
  │
  ├→ POST llm-orchestrator/internal/scoring/final
  │     {targetRole, turns[]}
  │     → {overallScore: 0-100, categories[], turnScores[], strengths[], improvements[]}
  │
  ├→ Lưu Report entity: {sessionId, overallScore, reportData: fullJSON}
  │
  └→ Session → REPORT_READY
```

### Tiêu chí chấm điểm từng câu (0-10)

| Tiêu chí | Mô tả |
|-----------|--------|
| Relevance | Trả lời đúng trọng tâm câu hỏi |
| Depth | Có ví dụ cụ thể, không chung chung |
| STAR method | Có Situation, Task, Action, Result (cho câu hành vi) |
| Clarity | Diễn đạt mạch lạc, logic |
| Confidence | Ít từ đệm, giọng rõ ràng |

### Tiêu chí report cuối — 5 phần (0-100, từ feedback thầy)

> **Thay đổi từ 4 tiêu chí cũ → 5 tiêu chí mới** (xem chi tiết `03-PHASE2` task 2.0 + `13-DEMO-PREPARATION-7MAR.md`)

| Tiêu chí | Trọng số | Mô tả | Mạnh/Yếu |
|----------|----------|--------|-----------|
| Sự tự tin | 20% | Giọng nói rõ ràng, ít ngập ngừng, dám nêu quan điểm | ✓ mạnh + ✗ yếu + 💡 mẹo |
| Kĩ năng giao tiếp | 25% | Diễn đạt mạch lạc, đúng trọng tâm, biết kể chuyện | ✓ mạnh + ✗ yếu + 💡 mẹo |
| Giải quyết vấn đề | 20% | Tư duy logic, phân tích, đưa giải pháp cụ thể | ✓ mạnh + ✗ yếu + 💡 mẹo |
| Chuyên môn | 25% | Kiến thức kỹ thuật, chiều sâu, ví dụ thực tế | ✓ mạnh + ✗ yếu + 💡 mẹo |
| Thái độ & Growth | 10% | Tích cực, ham học, tự nhận thức | ✓ mạnh + ✗ yếu + 💡 mẹo |

### Report output — phải đảm bảo

1. **Điểm tổng** + giải thích ngắn 1-2 câu
2. **Điểm từng tiêu chí** + feedback mỗi tiêu chí
3. **Điểm từng câu** + feedback cụ thể + STAR analysis
4. **Câu trả lời mẫu** cho mỗi câu (tốt hơn câu trả lời user)
5. **Top 3 strengths** — điểm mạnh nổi bật
6. **Top 3 improvements** — cần cải thiện, có MẸO cụ thể làm ngay

### Files cần tạo/sửa

**core-backend**:
- `ReportGenerationService.java` — Orchestrate scoring flow (@Async)
- `LlmOrchestratorClient.java` — HTTP client gọi llm-orchestrator

---

## 1.4 — WebSocket Events

### Nghiệp vụ

**Sinh viên (B2C)**:
- Khi session chuyển trạng thái → UI tự động cập nhật (không phải refresh)
- Khi đang chờ report → UI tự chuyển sang report page khi xong
- Transcript real-time hiển thị trong interview room

**Doanh nghiệp (B2B — future)**:
- HR dashboard tự động cập nhật khi ứng viên hoàn thành phỏng vấn

### Events

| Event | Khi nào | Payload |
|-------|---------|---------|
| session.state_changed | Mỗi state transition | {oldState, newState} |
| transcript.turn | Nhận transcript mới | {turnIndex, speaker, text} |
| report.ready | Report đã tạo xong | {reportId, overallScore} |

### Files cần tạo/sửa

**core-backend**:
- `SessionEventHandler.java` — Raw WebSocket handler
- `SessionEventPublisher.java` — Publish events to connected clients

---

## 1.5 — Trang Report

### Nghiệp vụ

**Sinh viên (B2C)**:
- Xem report ngay sau phỏng vấn — MOMENT OF TRUTH
- Report phải CỤ THỂ: số liệu, STAR, mẫu sửa, checklist 24h
- Nếu report chung chung → user rời bỏ NGAY (insight khảo sát 53.7%)
- Có nút "Phỏng vấn lại" để luyện tiếp
- Có nút "Chia sẻ" kết quả (tạo scorecard)

**Doanh nghiệp (B2B — future)**:
- HR xem report ứng viên với thông tin đầy đủ hơn
- HR có thêm: so sánh, ghi chú, quyết định (mời/cân nhắc/từ chối)

### Màn hình (B2C)

```
┌──────────────────────────────────────────────────────┐
│  📊 Báo cáo phỏng vấn                               │
│  Frontend Developer — Junior    26/02/2026           │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ĐIỂM TỔNG: 72/100                                  │
│  [██████████████████████░░░░░░░░]                    │
│  "Kiến thức nền tốt, cần cải thiện cấu trúc STAR"  │
│  ⓘ Tiêu chí: STAR + kỹ thuật + phong thái          │
│                                                       │
│  ── Điểm theo tiêu chí ──                           │
│  Kỹ thuật:  ████████░░ 80   Giao tiếp: ██████░░░░ 65│
│  Tư duy:    ███████░░░ 75   Phù hợp:   ███████░░░ 70│
│                                                       │
│  ── Số liệu nhanh ──                                │
│  🗣 Tốc độ: 145 WPM ✓  |  🔇 Từ đệm: 8 lần ⚠    │
│  ⏸ Im lặng: 6.2s ✓    |  👁 Mắt: 68% ⚠           │
│                                                       │
│  ── STAR Analysis ──                                 │
│  Câu 2: S✓ T✓ A✓ R✗ → Thiếu kết quả cụ thể      │
│  💡 "Thêm: dự án tăng 20% conversion rate"          │
│                                                       │
│  ── Từng câu (mở rộng) ──                           │
│  ▸ C1: Giới thiệu — 8/10 + mẫu tốt hơn            │
│  ▸ C2: Dự án — 7/10 + STAR + mẫu                   │
│  ▸ C3-C6...                                          │
│                                                       │
│  ── Top 3 ưu tiên sửa (Checklist 24h) ──           │
│  ☐ 1. Giảm từ đệm → dừng im 1 giây thay "ờ"      │
│  ☐ 2. Thêm Result vào STAR → "tăng X%, phục vụ Y" │
│  ☐ 3. Nhìn camera khi trả lời → dán sticker nhắc   │
│                                                       │
│  [← Dashboard]  [🔄 Luyện lại]  [📤 Chia sẻ]       │
└──────────────────────────────────────────────────────┘
```

### Files cần tạo

**web-app**:
- `report/page.tsx` — Trang report chính
- `report/ScoreOverview.tsx` — Điểm tổng + tiêu chí
- `report/QuickMetrics.tsx` — WPM, từ đệm, eye contact
- `report/STARAnalysis.tsx` — Phân tích STAR
- `report/TurnScoreCard.tsx` — Chi tiết từng câu + mẫu
- `report/ActionChecklist.tsx` — Top 3 ưu tiên sửa

---

## 1.6 — Consent Screen

### Nghiệp vụ

**Sinh viên (B2C)**:
- BẮT BUỘC trước khi bật camera/mic — không skip được
- User phải đồng ý: mic, camera, AI phân tích
- Giải thích TẠI SAO cần từng quyền
- Cam kết bảo mật rõ ràng: "Video KHÔNG ghi lại, Audio KHÔNG lưu"
- 100% personas sinh viên lo về bảo mật → phải giải quyết ở đây

**Doanh nghiệp (B2B — future)**:
- Ứng viên từ link HR cũng phải consent
- Thêm: "Kết quả sẽ được chia sẻ với [Tên công ty] để đánh giá"

### Màn hình

```
┌──────────────────────────────────────────────────────┐
│  Trước khi bắt đầu phỏng vấn                       │
│                                                       │
│  ☑ Microphone → Để AI nghe và phản hồi giọng nói   │
│  ☑ Camera → Để phân tích ngôn ngữ cơ thể           │
│  ☑ AI phân tích → Chấm điểm + gợi ý cải thiện     │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ 🔒 Cam kết bảo mật:                           │  │
│  │ • Video KHÔNG được ghi lại                     │  │
│  │ • Audio chỉ xử lý real-time                    │  │
│  │ • Dữ liệu mã hóa end-to-end                   │  │
│  │ • Chỉ lưu: text transcript + điểm số          │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  [Tôi đồng ý — Bắt đầu phỏng vấn →]              │
│  [← Quay về]                                         │
└──────────────────────────────────────────────────────┘
```

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | /api/v1/sessions/{id}/consent | Bearer token | {cameraConsent, micConsent, aiConsent} | Session (state=JOINING) |

---

## Thứ tự thực hiện Phase 1

```
1.1 Transcript storage     ← bắt đầu từ đây
  │
  └→ 1.2 State machine
       │
       ├→ 1.3 Scoring + Report (cần transcript + state)
       │
       ├→ 1.6 Consent screen (song song với 1.3)
       │
       └→ 1.4 WebSocket events
            │
            └→ 1.5 Report page (cần tất cả trên)
```
