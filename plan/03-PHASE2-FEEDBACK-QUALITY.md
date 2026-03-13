# Phase 2: Feedback chất lượng — Chi tiết kỹ thuật

> Goal: Report phải actionable, cụ thể, có số liệu — khác biệt hoàn toàn với ChatGPT
> ĐÂY LÀ MOMENT OF TRUTH — quyết định user ở lại hay rời đi (CJM Stage 2)
>
> Giải quyết:
> - "feedback chung chung" (53.7%) — #1 pain point với tools hiện tại
> - "không được sửa lỗi cụ thể" (39.8%)
> - "dùng từ đệm nhiều, không chuyên nghiệp" (39.8%)
> - "không biết sắp xếp ý cho logic" (30.1%)
>
> Personas:
> - Hà: "đếm chính xác số từ đệm, đo thời gian im lặng"
> - Đạt: "AI dựa vào đâu để đánh giá? Phải minh bạch tiêu chí"
> - Ngọc: "chỉ ra lỗi sai cụ thể và gợi ý câu trả lời mẫu tốt hơn"
> - Đạt: "nói đến đâu sửa đến đấy, như app học tiếng Anh"
>
> Quy tắc vàng (từ CJM):
> - KHÔNG ĐƯỢC nói: "Bạn cần tự tin hơn" → QUÁ CHUNG CHUNG → user rời bỏ ngay
> - PHẢI nói: "Bạn dùng 8 từ đệm (ờ:3, à:3, ừm:2). Mẹo: Dừng im 1 giây thay vì nói ờ."
>
> **Feedback thầy (7/3/2026 demo deadline)**:
> - Chấm điểm TỪNG PHẦN: sự tự tin, kĩ năng giao tiếp (2 câu), giải quyết vấn đề, chuyên môn (2 câu)
> - Cho biết cái MẠNH cái YẾU từng phần → linh hoạt
> - Xem chi tiết rubric và 10 câu hỏi mẫu tại `13-DEMO-PREPARATION-7MAR.md`

---

## 2.0 — Rubric chấm điểm 5 tiêu chí (MỚI — từ feedback thầy)

### Nghiệp vụ

**Yêu cầu thầy**: Chấm điểm từng phần, cho biết mạnh/yếu, linh hoạt.

**5 tiêu chí đánh giá** (thay thế 4 tiêu chí cũ — Technical/Communication/Problem-solving/Cultural Fit):

| Tiêu chí | Trọng số | Câu hỏi liên quan | Đánh giá |
|----------|----------|-------------------|----------|
| **Sự tự tin** | 20% | Xuyên suốt (giọng nói, ngập ngừng, từ đệm) | AI + speech metrics |
| **Kĩ năng giao tiếp** | 25% | 2 câu chính (sở thích, thói quen) + overall | AI + speech metrics |
| **Giải quyết vấn đề** | 20% | 2 câu tình huống (kỹ thuật + teamwork) | AI analysis |
| **Chuyên môn** | 25% | 2 câu chuyên môn (tự đánh giá + dự án) | AI analysis |
| **Thái độ & Growth** | 10% | motivation + self-awareness + teamwork | AI analysis |

### Output từng tiêu chí

Mỗi tiêu chí gồm:
- **score** (0-10): Điểm số
- **feedback**: Nhận xét tổng
- **strength**: Điểm MẠNH cụ thể
- **weakness**: Điểm YẾU cụ thể
- **tip**: 1 mẹo actionable để cải thiện ngay

### Luồng kỹ thuật

```
core-backend (ReportGenerationService)      llm-orchestrator
       │                                          │
       │  POST /internal/scoring/final            │
       │  {targetRole, level, turns[],            │
       │   speechMetrics, visionMetrics}          │
       │─────────────────────────────────────────→│
       │                                          │  Gemini analyze:
       │                                          │  - Score 5 sections
       │                                          │  - Identify strength/weakness
       │                                          │  - Generate tips
       │  {overallScore, sections: [              │
       │    {name, score, weight, feedback,       │
       │     strength, weakness, tip}             │
       │  ], top3Actions, summary}                │
       │←─────────────────────────────────────────│
```

### Files cần tạo/sửa

**llm-orchestrator-service**:
- Sửa `src/routes/scoring.ts` — Final report prompt: yêu cầu Gemini chấm 5 tiêu chí + mạnh/yếu/mẹo
- Sửa `src/schemas/report.schema.ts` — Thêm `sections[]` schema với strength/weakness/tip
- Sửa turn scoring: tag mỗi turn với tiêu chí chính nó đánh giá

**core-backend**:
- Sửa `ReportGenerationService.java` — Truyền speechMetrics + visionMetrics vào scoring request
- Report entity `reportData` JSONB lưu sections[] thay vì categories[]

**web-app**:
- Sửa report page — Hiển thị 5 tiêu chí: score bar + mạnh + yếu + tip

---

## 2.1 — Speech Metrics trong Report

### Nghiệp vụ

**Sinh viên (B2C)**:
- User thấy SỐ LIỆU CỤ THỂ về cách nói: tốc độ bao nhiêu WPM, bao nhiêu từ đệm, im lặng bao lâu
- Giải quyết insight Hà: "đếm chính xác số từ đệm, đo thời gian im lặng"
- Metrics hiển thị trực tiếp trong report, so sánh với ngưỡng tham khảo
- Khác biệt hoàn toàn với ChatGPT — không chỉ "nói mạch lạc hơn" mà "bạn nói 145 WPM, dùng 8 từ đệm"

**Doanh nghiệp (B2B — future)**:
- HR xem speech metrics để đánh giá communication skill của ứng viên
- Metrics giúp HR so sánh ứng viên khách quan: ai nói rõ ràng hơn, ít từ đệm hơn
- Bảng so sánh ứng viên hiển thị cột WPM, filler count, eye contact

### Luồng kỹ thuật

```
voice-agent-service                    core-backend                   PostgreSQL
       │                                    │                              │
       │  Gemini trả transcript (isFinal)   │                              │
       │  + speech metrics per turn         │                              │
       │──── POST /internal/sessions/       │                              │
       │     {id}/transcripts               │                              │
       │     {turnIndex, speaker, text,     │  Validate session exists     │
       │      metrics: {wpm, fillerWords,   │  Save with metrics JSONB     │
       │      fillerWordCount,              │─────────────────────────────→│
       │      silenceDurationMs,            │                              │
       │      totalDurationMs}}             │                              │
       │                                    │                              │
       │     {id, status: "saved"}          │                              │
       │←───────────────────────────────────│                              │
```

### Database

```sql
-- Metrics column trong bảng transcripts (đã tạo Phase 1, V7)
-- Nếu chưa có column metrics:
-- V8__add_metrics_to_transcripts.sql
ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS metrics JSONB;
```

Cấu trúc `metrics` JSONB:
```json
{
  "wpm": 145,
  "fillerWords": ["ờ", "à", "ừm"],
  "fillerWordCount": 7,
  "silenceDurationMs": 3200,
  "totalDurationMs": 45000
}
```

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | /internal/sessions/{id}/transcripts | Internal API key | {turnIndex, speaker, text, startTimeMs, endTimeMs, isFinal, **metrics**} | {id, status: "saved"} |
| GET | /api/v1/sessions/{id}/transcripts | Bearer token | — | TranscriptTurn[] (bao gồm metrics) |

### Files cần tạo/sửa

**voice-agent-service**:
- Sửa `src/agent.ts` — Tích lũy metrics per turn: wpm, fillerWordCount, silenceDurationMs, totalDurationMs
- Gửi metrics object kèm transcript callback tới core-backend

**core-backend**:
- Sửa `Transcript.java` entity — thêm field `metrics` (JSONB) nếu chưa có
- Sửa `TranscriptController.java` — Accept metrics trong POST body
- `V8__add_metrics_to_transcripts.sql` (nếu V7 chưa có metrics column)

---

## 2.2 — STAR Analysis

### Nghiệp vụ

**Sinh viên (B2C)**:
- User học cách trả lời có CẤU TRÚC — không phải nói lan man rồi quên kết quả
- STAR (Situation, Task, Action, Result) phân tích từng câu behavioral
- Chỉ ra THIẾU component nào + gợi ý cụ thể cách bổ sung
- Giải quyết insight: "không biết sắp xếp ý cho logic" (30.1%)

**Doanh nghiệp (B2B — future)**:
- HR dùng STAR analysis để đánh giá behavioral fit khách quan
- STAR score (3/4, 4/4) giúp HR biết ứng viên có trả lời đủ sâu không
- Bảng so sánh hiển thị cột STAR per ứng viên

### Luồng kỹ thuật

```
core-backend (ReportGenerationService)      llm-orchestrator
       │                                          │
       │  Cho mỗi cặp câu hỏi behavioral:       │
       │  POST /internal/scoring/turn             │
       │  {question, answer, category,            │
       │   difficulty, requireSTAR: true}         │
       │─────────────────────────────────────────→│
       │                                          │  Gemini analyze:
       │                                          │  - Identify S/T/A/R
       │                                          │  - Flag missing
       │                                          │  - Suggest addition
       │  {score, feedback, starComponents,       │
       │   starSuggestion}                        │
       │←─────────────────────────────────────────│
```

### STAR Output per câu

```json
{
  "starAnalysis": [
    {
      "questionIndex": 1,
      "question": "Kể về dự án tâm đắc",
      "components": {
        "situation": true,
        "task": true,
        "action": true,
        "result": false
      },
      "missing": ["Result"],
      "suggestion": "Bạn nên thêm kết quả cụ thể: 'Dự án giúp tăng 20% conversion rate, phục vụ 5,000 users/ngày'"
    }
  ]
}
```

### Files cần tạo/sửa

**llm-orchestrator-service**:
- Sửa `src/routes/scoring.ts` — Turn scoring prompt: yêu cầu Gemini identify STAR components
- Sửa Zod schema cho turn scoring response — thêm `starComponents`, `starSuggestion`
- Sửa final report prompt — tổng hợp STAR analysis per question

**core-backend**:
- Sửa `ReportGenerationService.java` — Truyền category vào turn scoring request
- Report entity `reportData` JSONB đã chứa starAnalysis

---

## 2.3 — Sample Answers (câu trả lời mẫu)

### Nghiệp vụ

**Sinh viên (B2C)**:
- User có MẪU CÂU TRẢ LỜI TỐT HƠN để đối chiếu và tự cải thiện
- Giải quyết insight Ngọc: "cung cấp câu trả lời mẫu để đối chiếu sửa sai"
- Giải quyết insight Hà: "gợi ý câu trả lời tốt hơn"
- Khảo sát: 59.3% muốn "gợi ý sửa câu trả lời chuyên nghiệp hơn"
- Mẫu cụ thể cho ROLE + LEVEL của user, không generic

**Doanh nghiệp (B2B — future)**:
- HR thấy KHOẢNG CÁCH giữa câu trả lời thực tế vs câu trả lời mẫu
- Giúp HR đánh giá: ứng viên cách mức "tốt" bao xa
- HR report hiển thị actual vs ideal side-by-side

### Luồng kỹ thuật

```
core-backend                         llm-orchestrator
       │                                    │
       │  POST /internal/scoring/turn       │
       │  {question, answer, category,      │
       │   targetRole, level}               │
       │───────────────────────────────────→│
       │                                    │  Gemini generate:
       │                                    │  - Score + feedback
       │                                    │  - Sample answer
       │                                    │  - Improvements list
       │  {score, feedback,                 │
       │   sampleAnswer,                    │
       │   improvements: [...]}             │
       │←───────────────────────────────────│
```

### Sample output per câu

```json
{
  "score": 7,
  "feedback": "Câu trả lời tốt nhưng thiếu kết quả cụ thể",
  "sampleAnswer": "Trong vai trò Frontend Developer tại dự án X, tôi đã phát hiện performance issue khiến load time > 5s. Tôi dùng Chrome DevTools profiling, tìm ra re-render không cần thiết, áp dụng React.memo + useMemo. Kết quả: load time giảm từ 5s xuống 1.2s, Lighthouse score tăng từ 45 lên 85.",
  "improvements": ["Thêm số liệu cụ thể", "Dùng cấu trúc STAR", "Nêu impact rõ ràng"]
}
```

### Files cần tạo/sửa

**llm-orchestrator-service**:
- Sửa `src/routes/scoring.ts` — Thêm `sampleAnswer` trong turn scoring prompt
- Prompt engineering: "Provide a sample answer that is better than the candidate's, specific to their role ({targetRole}) and experience level ({level})"
- Sửa Zod schema cho turn scoring response — thêm `sampleAnswer: z.string()`, `improvements: z.array(z.string())`

---

## 2.4 — Vision Metrics trong Report

### Nghiệp vụ

**Sinh viên (B2C)**:
- User biết BODY LANGUAGE của mình qua SỐ LIỆU: eye contact bao nhiêu %, head pose ổn định chưa
- Giải quyết insight khảo sát: 43.1% muốn "soi lỗi cơ thể"
- Không chỉ warning real-time mà aggregate thành metrics cho report
- So sánh với ngưỡng tham khảo: "68% eye contact — Cần tăng (mục tiêu >80%)"

**Doanh nghiệp (B2B — future)**:
- HR có data về PHONG THÁI ứng viên dựa trên số liệu khách quan
- HR xem: "Eye contact 68%, Từ đệm 8 lần" → đánh giá communication + confidence
- Bảng so sánh ứng viên có cột eye contact %, giúp HR chọn ứng viên có phong thái tốt

### Luồng kỹ thuật

```
vision-analytics-service              core-backend (ReportGenerationService)
       │                                       │
       │  Accumulate per session:              │
       │  - eyeContactPercent                  │
       │  - headStabilityScore                 │
       │  - fidgetingCount                     │
       │  - smileScore (confidence proxy)      │
       │                                       │
       │  GET /internal/sessions/{id}/         │
       │      vision-metrics                   │
       │←──────────────────────────────────────│
       │                                       │
       │  {eyeContactPercent: 68,             │
       │   headStabilityScore: 85,            │
       │   fidgetingCount: 3,                 │
       │   averageSmileScore: 0.6}            │
       │──────────────────────────────────────→│
       │                                       │  Include in report JSON
```

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | /internal/sessions/{id}/vision-metrics | Internal API key | — | {eyeContactPercent, headStabilityScore, fidgetingCount, averageSmileScore} |

### Ngưỡng tham khảo (hiển thị trong report)

| Metric | Tốt | Khá | Cần cải thiện |
|--------|-----|-----|---------------|
| Eye contact | >80% | 60-80% | <60% |
| Head stability | >85% | 70-85% | <70% |
| Fidgeting | 0-2 lần | 3-5 lần | >5 lần |

### Files cần tạo/sửa

**vision-analytics-service**:
- Sửa `app/services/signal_processor.py` — Accumulate metrics per session (dict session_id → metrics)
- File mới: `app/routes/metrics.py` — `GET /internal/sessions/{sessionId}/vision-metrics`
- Return aggregated metrics cho session

**core-backend**:
- Sửa `ReportGenerationService.java` — Khi generate report, gọi thêm vision-analytics để lấy metrics
- Include vision metrics trong report `reportData` JSONB

---

## 2.5 — Report Page v2 (Rich Report)

### Nghiệp vụ

**Sinh viên (B2C)**:
- Rich report hiển thị TẤT CẢ: scores + STAR analysis + speech metrics + vision metrics + sample answers
- Report phải CỤ THỂ — đây là lý do user trả tiền, khác biệt với ChatGPT
- Top 3 ưu tiên sửa (24h checklist) — actionable ngay
- Nút "Phỏng vấn lại" + "Chia sẻ" ngay trong report

**Doanh nghiệp (B2B — future)**:
- HR report kèm thêm: bảng so sánh tiêu chí, ghi chú HR, disclaimer AI
- HR xem report ứng viên với metrics + transcript + STAR + scores
- Disclaimer luôn hiển thị: "Đánh giá AI, chỉ mang tính tham khảo"
- HR có nút: Mời vòng 2 / Cân nhắc / Từ chối

### Màn hình B2C — Report v2

```
┌──────────────────────────────────────────────────────────┐
│  📊 Báo cáo phỏng vấn                                   │
│  Frontend Developer — Junior    26/02/2026               │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─ TỔNG QUAN ──────────────────────────────────────┐    │
│  │  ĐIỂM TỔNG: 72/100                               │    │
│  │  [██████████████████████████░░░░░░░░░]            │    │
│  │  "Kiến thức nền tốt, cần cải thiện STAR"         │    │
│  │  ⓘ Chấm dựa trên: STAR + kỹ thuật + phong thái │    │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─ ĐIỂM THEO TIÊU CHÍ ────────────────────────────┐    │
│  │  Kỹ thuật:  ████████░░ 80  Giao tiếp: ██████░░░ 65│   │
│  │  Tư duy:    ███████░░░ 75  Phù hợp:   ███████░░ 70│   │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─ SỐ LIỆU NHANH ─────────────────────────────────┐    │
│  │  🗣 Tốc độ: 145 WPM ✓    🔇 Từ đệm: 8 lần ⚠  │    │
│  │     Chi tiết: ờ(3), à(3), ừm(2)                  │    │
│  │  ⏸ Im lặng: 6.2s ✓      👁 Mắt: 68% ⚠        │    │
│  │  🤸 Cử chỉ thừa: 2 lần ✓                       │    │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─ PHÂN TÍCH STAR ─────────────────────────────────┐    │
│  │  Câu 2 "Dự án tâm đắc":                         │    │
│  │  [S ✓] [T ✓] [A ✓] [R ✗]                       │    │
│  │  Thiếu Result → "Thêm: dự án tăng 20% ..."      │    │
│  │                                                    │    │
│  │  Câu 4 "Bất đồng trong team":                    │    │
│  │  [S ✗] [T ✓] [A ✓] [R ✓]                       │    │
│  │  Thiếu Situation → "Mở đầu bằng bối cảnh..."    │    │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─ CHI TIẾT TỪNG CÂU (mở rộng) ───────────────────┐    │
│  │  ▾ C1: Giới thiệu — 8/10                         │    │
│  │    Feedback: Rõ ràng, mạch lạc                    │    │
│  │    💬 Mẫu tốt hơn: "Em là Ngọc, SV năm cuối..." │    │
│  │  ▸ C2: Dự án — 7/10  STAR: 3/4                   │    │
│  │  ▸ C3-C6...                                       │    │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─ TOP 3 ƯU TIÊN SỬA (Checklist 24h) ─────────────┐    │
│  │  ☐ 1. Giảm từ đệm → dừng im 1 giây thay "ờ"    │    │
│  │  ☐ 2. Thêm Result vào STAR → "tăng X%, phục vụ Y"│   │
│  │  ☐ 3. Nhìn camera khi trả lời → dán sticker nhắc │    │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  [← Dashboard]  [🔄 Luyện lại]  [📤 Chia sẻ]            │
└──────────────────────────────────────────────────────────┘
```

### Màn hình B2B — HR xem Report ứng viên (xem chi tiết `12-UX-BUSINESS-B2B.md` Màn 5)

```
┌──────────────────────────────────────────────────────────┐
│  Report ứng viên — Ngọc N.H.                            │
│  Frontend Developer — Junior    26/02/2026               │
├──────────────────────────────────────────────────────────┤
│  ĐIỂM TỔNG: 78/100              ✓ Đề xuất mời          │
│  Nhận xét AI: "Kiến thức React tốt, giao tiếp rõ ràng" │
│                                                           │
│  ⚠ Đánh giá AI, chỉ mang tính tham khảo.               │
│  HR vui lòng đánh giá lại khi phỏng vấn trực tiếp.     │
│                                                           │
│  Tiêu chí    Trọng số   Điểm   Weighted                 │
│  Kỹ thuật    40%        80     32.0                      │
│  Giao tiếp   30%        72     21.6                      │
│  Tư duy      20%        75     15.0                      │
│  Phù hợp VH  10%        70     7.0                       │
│                                                           │
│  Quyết định: ○ Mời vòng 2  ○ Cân nhắc  ○ Từ chối      │
│  Ghi chú: [________________________]                     │
│  [Lưu đánh giá]                                          │
│                                                           │
│  [← Danh sách UV]  [📤 Xuất PDF]                        │
└──────────────────────────────────────────────────────────┘
```

### Files cần tạo/sửa

**web-app**:
- Sửa `report/page.tsx` — Nâng cấp từ Phase 1.5 → Rich report v2
- Sửa `report/ScoreOverview.tsx` — Điểm tổng + progress bar + nhận xét
- File mới: `report/SpeechMetrics.tsx` — WPM, filler words (chi tiết), silence
- File mới: `report/VisionMetrics.tsx` — Eye contact %, body language scores
- Sửa `report/STARAnalysis.tsx` — STAR components badges per question
- File mới: `report/SampleAnswer.tsx` — Collapsible mẫu câu trả lời per câu
- `report/TurnScoreCard.tsx` — Chi tiết từng câu + score + feedback + sample
- `report/ActionChecklist.tsx` — Top 3 ưu tiên sửa

Dùng `recharts` (đã có trong dependencies) cho charts nếu cần.

---

## 2.6 — Real-time Transcript Panel

### Nghiệp vụ

**Sinh viên (B2C)**:
- User thấy AI "NGHE" mình — transcript hiển thị real-time trong interview room
- Giảm lo lắng: "Nó hiểu mình nói gì chứ?" → Thấy text xuất hiện → yên tâm
- Auto-scroll, partial transcript (đang nói...), speaker icons
- CJM Stage 2: "Lỗi nhận diện giọng nói/độ trễ làm hội thoại đứt mạch" → transcript giúp verify

**Doanh nghiệp (B2B — future)**:
- HR xem transcript đầy đủ sau phỏng vấn kèm highlights (score, metrics per turn)
- HR đọc transcript để đánh giá chất lượng câu trả lời chi tiết
- Transcript page hiển thị: timestamp + text + metrics + score per turn (xem `12-UX-BUSINESS-B2B.md` Màn 7)

### Màn hình — Interview Room Transcript Panel

```
+----------------------------------+
|  Nội dung phỏng vấn             |
+----------------------------------+
|  🤖 Minh: Xin chào, hãy giới  |
|  thiệu bản thân bạn nhé.        |
|                                   |
|  👤 Bạn: Dạ em chào anh...     |
|                                   |
|  🤖 Minh: Vậy dự án nào bạn   |
|  tâm đắc nhất?                   |
|                                   |
|  👤 Bạn: [đang nói... ●]       |
+----------------------------------+
```

### Màn hình — HR Transcript (post-interview, B2B future)

```
┌──────────────────────────────────────────────────────────┐
│  Transcript — Ngọc N.H.    Frontend Developer            │
├──────────────────────────────────────────────────────────┤
│  🤖 AI (00:00): Chào bạn Ngọc!...                       │
│                                                           │
│  👤 Ngọc (00:15): Dạ em chào anh Minh...                │
│  Metrics: WPM 138 | Từ đệm: 1 | Eye contact: 72%       │
│  ─── Score: 8/10 ─── Feedback: Rõ ràng, mạch lạc       │
│                                                           │
│  🤖 AI (01:45): Hay lắm! Dự án nào tâm đắc nhất?       │
│                                                           │
│  👤 Ngọc (02:00): Dạ, ờ, em tâm đắc nhất là...         │
│  Metrics: WPM 152 | Từ đệm: 3 | EC: 60%                │
│  ─── Score: 7/10 ─── STAR: S✓ T✓ A✓ R✗                 │
└──────────────────────────────────────────────────────────┘
```

### Files cần tạo/sửa

**web-app**:
- File mới: `src/components/interview/TranscriptPanel.tsx` — Real-time transcript display
  - Auto-scroll to latest message
  - Speaker icons (AI 🤖 / User 👤)
  - Partial transcript italic ("đang nói...")
  - Timestamps (expandable)
- Sửa interview room page — 2 column layout: video + transcript
  - Desktop: side-by-side
  - Mobile: transcript ẩn, swipe up hoặc toggle button

---

## Thứ tự thực hiện Phase 2

```
2.1 Speech metrics     (voice-agent + core-backend)
2.6 Transcript panel   (web-app) — song song, không dependency
    |
    +-> 2.2 STAR analysis    (llm-orchestrator)
    +-> 2.3 Sample answers   (llm-orchestrator)  — song song với 2.2
    +-> 2.4 Vision metrics   (vision-analytics + core-backend)
         |
         +-> 2.5 Report page v2 (web-app) — cần tất cả data trên
```
