# Phase 3: Interview UX — Chi tiết kỹ thuật

> Goal: Trải nghiệm mượt mà, giống video call thật
> Insight persona Đạt: "quá trình tương tác phải mượt, đừng đơ đơ lag lag"
> Insight persona Ngọc: "Trải nghiệm tệ: Lo ngại app bị lag, giao diện rối rắm, giọng nói AI quá máy móc"
> Insight CJM Stage 2: "Lỗi nhận diện giọng nói/độ trễ làm hội thoại đứt mạch → giảm cảm giác người thật"
> Khảo sát: 90.2% kỳ vọng "giao tiếp tự nhiên giống người thật"
> Moment of Truth: Session đầu tiên phải hoàn hảo — xem chi tiết tại `08-UX-STUDENT-B2C.md`
>
> **Feedback thầy (7/3/2026 demo)**:
> - AI phải TRÒ CHUYỆN nâng cao, KHÔNG phỏng vấn cứng nhắc
> - AI trả lời NGẮN (1-2 câu) như người phỏng vấn thật
> - Hỏi ĐA DẠNG chủ đề: sở thích, thói quen, tình huống, thái độ (không chỉ kỹ thuật)
> - AI tự điều chỉnh theo cách trả lời của ứng viên (adaptive)
> - Xem kịch bản demo chi tiết: `13-DEMO-PREPARATION-7MAR.md`

---

## 3.A — Conversational AI Tuning (MỚI — từ feedback thầy, P0 cho demo)

### Nghiệp vụ

**Yêu cầu thầy**: AI phải demo như đang trò chuyện nâng cao, KHÔNG phải như phỏng vấn cứng. AI trả lời ít, hỏi theo câu trả lời ứng viên, đa dạng chủ đề.

**Sinh viên (B2C)**:
- AI hỏi 8-10 câu đa dạng: kỹ thuật + sở thích + thói quen + tình huống + thái độ
- AI phản hồi NGẮN (1-2 câu) rồi hỏi tiếp — như người thật
- AI KHÔNG đọc danh sách câu hỏi, mà dẫn dắt tự nhiên
- AI hỏi follow-up dựa trên câu trả lời trước đó
- AI điều chỉnh theo pattern ứng viên (trả lời ngắn → gợi mở, trả lời dài → tóm tắt)

**Doanh nghiệp (B2B — future)**:
- HR config chủ đề câu hỏi (bỏ bớt sở thích/thói quen, thêm chuyên môn)
- Tương tự conversational nhưng formal hơn

### Quy tắc AI conversational

```
❌ SAI (rigid):
  AI: "Câu 1: Hãy giới thiệu bản thân"
  User: "..."
  AI: "Câu 2: Tại sao bạn muốn làm vị trí này?"

✓ ĐÚNG (trò chuyện):
  AI: "Chào bạn! Mình là Minh, hôm nay mình muốn trò chuyện
       để hiểu hơn về bạn nhé. Kể qua về mình đi!"
  User: "Dạ em tên Ngọc, SV năm cuối FPT, có làm React..."
  AI: "Ồ React thú vị nhỉ! Ngoài code, bạn có sở thích gì vui không?"
       ← NGẮN + PHẢN HỒI + DẪN DẮT TỰ NHIÊN
```

### Đa dạng chủ đề (10 câu hỏi mẫu)

| Chủ đề | Ví dụ | Tiêu chí đánh giá |
|--------|-------|-------------------|
| Giới thiệu / Kinh nghiệm | "Kể về mình đi — đang làm gì?" | Giao tiếp, Tự tin |
| Động lực tìm việc | "Tại sao muốn làm Frontend?" | Tự tin, Thái độ |
| Sở thích cá nhân | "Ngoài code, giải trí kiểu gì?" | Giao tiếp |
| Thói quen | "Thói quen hàng ngày? Có routine gì?" | Giao tiếp |
| Chuyên môn (câu 1) | "Mạnh nhất ở đâu trong Frontend?" | Chuyên môn |
| Chuyên môn (câu 2) | "Kể về dự án tự hào nhất?" | Chuyên môn |
| Tình huống kỹ thuật | "Trang web load chậm, xử lý sao?" | Giải quyết vấn đề |
| Tình huống teamwork | "Ai code style khác, bạn làm sao?" | GQVĐ + Thái độ |
| Tự nhận thức | "Cần cải thiện gì nhất?" | Tự tin, Thái độ |
| Kết thúc | "Bạn có câu hỏi gì muốn hỏi không?" | Tự tin, Giao tiếp |

### AI Adaptive — Tự điều chỉnh theo ứng viên

| Pattern ứng viên | AI phản ứng |
|-------------------|-------------|
| Trả lời ngắn (< 15s) | Gợi mở: "Kể thêm chút đi!" |
| Trả lời dài (> 90s) | Summary: "OK hay lắm, vậy mình qua chủ đề khác nhé" |
| Nhiều từ đệm | Nói chậm, tạo không khí thoải mái |
| Trả lời chung chung | Hỏi cụ thể: "Cho mình 1 ví dụ?" |
| Lo lắng/ngập ngừng | Khuyến khích: "Không sao, từ từ nhé!" |

### Implementation

**Sửa**: `voice-agent-service/src/agent.ts` — System prompt:
- Thêm quy tắc conversational (trả lời ngắn, phản hồi trước, dẫn dắt tự nhiên)
- Thêm 10 chủ đề cần cover (xem `13-DEMO-PREPARATION-7MAR.md`)
- Thêm adaptive rules (gợi mở khi ngắn, tóm tắt khi dài)
- Thêm: "KHÔNG đánh số câu hỏi, KHÔNG nói 'Câu hỏi tiếp theo'"

**Sửa**: `voice-agent-service/src/geminiClient.ts` — Config Gemini:
- Giảm response length (maxOutputTokens) để AI trả lời ngắn hơn
- Tăng temperature nhẹ (0.8) cho trả lời tự nhiên hơn

---

## 3.0 — Onboarding Flow

### Nghiệp vụ

**Sinh viên (B2C)**:
- SV tự chọn vị trí ứng tuyển + level kinh nghiệm
- Upload CV là TÙY CHỌN — giải thích tại sao nên upload (AI hỏi câu sát kinh nghiệm)
- Không có CV → AI hỏi câu chung cho vị trí — vẫn phỏng vấn được
- Tối thiểu friction: chỉ 2 bắt buộc (vị trí + level), tối đa 60 giây onboarding
- CJM Stage 2: "Onboarding nhanh: nhập CV/JD/vị trí; chọn level; chọn kiểu phỏng vấn"

**Doanh nghiệp (B2B — future)**:
- Ứng viên đến từ LINK HR gửi → KHÔNG cần chọn vị trí/level (đã có từ HR config)
- JD auto-fill từ HR → AI tạo câu hỏi dựa trên JD
- Ứng viên chỉ cần: nhập tên + email + (tùy chọn) upload CV
- Flow ngắn hơn SV: tên/email → consent → room → report (skip chọn vị trí)

### Màn hình B2C — Onboarding (xem chi tiết `08-UX-STUDENT-B2C.md` Màn 4)

```
┌──────────────────────────────────────────────────────────┐
│  Thiết lập buổi phỏng vấn                               │
│                                                           │
│  📋 Bạn muốn ứng tuyển vị trí gì?                       │
│  [Frontend Developer                              ▾]     │
│                                                           │
│  📊 Cấp độ kinh nghiệm:                                 │
│     ○ Thực tập / Fresher                                 │
│     ● Junior (1-2 năm)                                   │
│     ○ Mid (3-5 năm)                                      │
│     ○ Senior (5+ năm)                                    │
│                                                           │
│  📄 Upload CV (không bắt buộc):                          │
│  [Kéo thả file hoặc click để chọn]                      │
│  → Có CV → AI hỏi câu sát kinh nghiệm bạn              │
│  → Không CV → AI hỏi câu chung cho vị trí               │
│                                                           │
│  [Tiếp tục →]                                            │
└──────────────────────────────────────────────────────────┘
```

### Màn hình B2B — Ứng viên từ link HR (xem chi tiết `12-UX-BUSINESS-B2B.md` Màn 4)

```
┌──────────────────────────────────────────────────────────┐
│  FPT Software mời bạn phỏng vấn AI                      │
│  Vị trí: Frontend Developer — Junior                     │
│                                                           │
│  Tên bạn:  [Nguyễn Hồng Ngọc                      ]     │
│  Email:    [ngoc@gmail.com                         ]     │
│                                                           │
│  📄 Upload CV (không bắt buộc):                          │
│  [Chọn file]                                              │
│                                                           │
│  Buổi phỏng vấn khoảng 15-20 phút.                      │
│  AI sẽ hỏi 6-7 câu về kỹ năng và kinh nghiệm.          │
│                                                           │
│  [Bắt đầu phỏng vấn →]                                  │
└──────────────────────────────────────────────────────────┘
```

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | /api/v1/sessions | Bearer token | {targetRole, level, cvFile?} | Session (state=CREATED) |
| POST | /api/v1/invitations/{code}/sessions | No auth | {candidateName, email, cvFile?} | Session (state=CREATED) + temp token |
| GET | /api/v1/invitations/{code} | No auth | — | {positionName, level, organizationName} |

### Files cần tạo/sửa

**web-app**:
- Sửa Dashboard → "Tạo phỏng vấn mới" → Onboarding flow 1 trang
- File mới: `src/app/onboarding/page.tsx` — B2C onboarding (role + level + CV)
- File mới: `src/app/apply/[code]/page.tsx` — B2B ứng viên landing (từ invite link)

**core-backend**:
- Sửa `SessionController.java` — Accept targetRole, level trong create session
- File mới: `InvitationController.java` — GET invitation info, POST create session from invitation

---

## 3.1 — Interview Multi-step Flow

### Nghiệp vụ

**Sinh viên (B2C)**:
- Flow rõ ràng: upload CV → consent → room → report
- Redirect tự động dựa trên session state — user không phải navigate thủ công
- Mỗi state có trang riêng, UI phù hợp (không nhồi tất cả vào 1 page)

**Doanh nghiệp (B2B — future)**:
- Ứng viên từ HR link: consent → room → report (SKIP upload vì JD đã có từ HR)
- Flow ngắn hơn — ít friction hơn cho ứng viên
- Nếu ứng viên tùy chọn upload CV → thêm bước parse trước consent

### State → Route mapping

```typescript
// B2C flow
const stateRoutesB2C = {
  CREATED: '/upload',        // Chưa upload CV
  CV_UPLOADING: '/upload',   // Đang parse
  CV_PARSED: '/consent',     // Cần consent
  CONSENT_PENDING: '/consent',
  JOINING: '/room',          // Đang kết nối
  LIVE: '/room',             // Đang phỏng vấn
  WRAP_UP: '/room',          // Đang kết thúc
  ENDED: '/report',          // Chờ report
  SCORING: '/report',        // Đang scoring
  REPORT_READY: '/report',   // Có report
};

// B2B flow (ứng viên từ invite link)
const stateRoutesB2B = {
  CREATED: '/consent',       // Skip upload (JD từ HR)
  CV_UPLOADING: '/consent',  // Nếu UV tùy chọn upload
  CV_PARSED: '/consent',
  CONSENT_PENDING: '/consent',
  JOINING: '/room',
  LIVE: '/room',
  WRAP_UP: '/room',
  ENDED: '/report',
  SCORING: '/report',
  REPORT_READY: '/report',
};
```

### Files cần tạo/sửa

**web-app**:
- Sửa `/interview/[sessionId]/page.tsx` → redirect dựa trên state + session type (B2C/B2B)
- File mới: `/interview/[sessionId]/upload/page.tsx` — CV upload (tách từ dashboard)
- File mới: `/interview/[sessionId]/room/page.tsx` — Video + audio + transcript + controls
- Consent page + Report page đã có từ Phase 1

---

## 3.2 — Interview Timer + Question Progress

### Nghiệp vụ

**Sinh viên (B2C)**:
- User thấy mình đang ở câu mấy: "Câu 2/6 — Kinh nghiệm dự án"
- Timer đếm lên từ khi bắt đầu phỏng vấn: MM:SS
- Giảm lo lắng: biết còn bao nhiêu câu nữa, không sợ "không biết khi nào xong"

**Doanh nghiệp (B2B — future)**:
- HR config số câu hỏi + thời gian tối đa khi tạo vị trí
- Ứng viên thấy timer + progress theo config HR
- HR xem thời gian phỏng vấn thực tế trong report

### Màn hình

```
┌──────────────────────────────────────────┐
│  ⏱ 05:23    Câu 2/6 — Dự án tâm đắc    │
│  [======>                          ]     │
└──────────────────────────────────────────┘
```

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| — | (WebSocket từ voice-agent) | — | transcript event kèm meta | {questionIndex, totalQuestions, topic} |

### Files cần tạo/sửa

**web-app**:
- File mới: `src/components/interview/InterviewTimer.tsx` — Start khi state=LIVE, format MM:SS
- File mới: `src/components/interview/QuestionProgress.tsx` — "Câu 2/6 — topic" + progress bar

**voice-agent-service**:
- Sửa `src/agent.ts` — Track currentQuestionIndex, include trong transcript events:
  ```json
  { "type": "transcript", "meta": { "questionIndex": 2, "totalQuestions": 6, "topic": "Kinh nghiệm dự án" } }
  ```

---

## 3.3 — Vision Warning UX

### Nghiệp vụ

**Sinh viên (B2C)**:
- Warning toast NHẸ NHÀNG, KHUYẾN KHÍCH — không phê phán
- Tone: "Hãy nhìn vào camera nhiều hơn nhé" (không phải "Bạn không nhìn camera!")
- Auto-dismiss 3 giây, cooldown 5s per warning type (tránh spam)
- Không che video feed — user cần thấy mình

**Doanh nghiệp (B2B — future)**:
- Ứng viên: trải nghiệm tương tự SV, toast nhẹ nhàng
- Warning data được aggregate vào vision metrics cho HR report

### Implementation

**Cooldown logic** (vision-analytics-service):
```python
COOLDOWN_SECONDS = 5
_last_emitted: dict[str, float] = {}  # warning_type -> timestamp

def should_emit(warning_type: str) -> bool:
    now = time.time()
    if warning_type in _last_emitted:
        if now - _last_emitted[warning_type] < COOLDOWN_SECONDS:
            return False
    _last_emitted[warning_type] = now
    return True
```

**Toast UX** (web-app):
```
┌────────────────────────────────────────┐
│  👁 Hãy nhìn vào camera nhiều hơn nhé │  ← yellow, auto-dismiss 3s
└────────────────────────────────────────┘
```

- Color: yellow (warning), red (critical — VD: mất kết nối camera)
- Position: góc dưới phải video area
- Animation: slide in → 3s → fade out

### Files cần tạo/sửa

**vision-analytics-service**:
- Sửa `app/services/warning_emitter.py` — Implement cooldown 5s per warning type

**web-app**:
- Sửa `src/components/SelfVideo.tsx` — Thay overlay bằng toast notification ở góc
- File mới: `src/components/interview/VisionToast.tsx` — Toast component cho warnings

---

## 3.4 — Audio Quality

### Nghiệp vụ

**Sinh viên (B2C)**:
- Auto-reconnect nếu Gemini disconnect — user không phải refresh
- Buffer audio during reconnect → replay khi connected lại
- UI hiển thị trạng thái: "Đang kết nối lại..." (không để user hoang mang)
- Giải quyết insight Đạt: "đừng đơ đơ lag lag"

**Doanh nghiệp (B2B — future)**:
- Trải nghiệm tương tự SV — ổn định, không mất audio
- Đảm bảo phỏng vấn hoàn thành cho mọi ứng viên (avoid wasted HR slots)

### Luồng reconnect

```
Browser          voice-agent-service          Gemini Live API
  │                     │                          │
  │  audio stream       │  Gemini disconnects!     │
  │ ──────────────────→ │  ←── connection lost ────│
  │                     │                          │
  │  {status:           │  Buffer incoming audio   │
  │   "reconnecting"}   │  Retry #1 (1s delay)     │
  │ ←────────────────── │ ────────────────────────→│
  │                     │  Retry #2 (2s delay)     │
  │                     │ ────────────────────────→│
  │                     │  Connected!              │
  │  {status:           │  Replay buffered audio   │
  │   "connected"}      │ ────────────────────────→│
  │ ←────────────────── │                          │
  │                     │  Resume normal flow      │
```

### Files cần tạo/sửa

**voice-agent-service**:
- Sửa `src/geminiClient.ts` — Auto-reconnect with exponential backoff (3 attempts: 1s, 2s, 4s)
- Buffer audio during reconnect, replay khi connected lại
- Notify browser qua status event: `{ state: "reconnecting" }`, `{ state: "connected" }`

**web-app**:
- Sửa `src/hooks/useAudioStream.ts` — Handle "reconnecting" status
- Show reconnecting indicator: "Đang kết nối lại... Hãy tiếp tục nói."

---

## 3.5 — Loading States

### Nghiệp vụ

**Sinh viên (B2C)**:
- Mọi loading > 2s phải có indicator, > 10s phải có progress steps, > 30s phải có content giữ chân
- Tips giảm lo lắng trong lúc chờ: "Đây là không gian an toàn" (insight Ngọc)
- Fun facts về phỏng vấn: "Ứng viên TB dùng 12 từ đệm/buổi"
- KHÔNG BAO GIỜ hiển thị blank screen

**Doanh nghiệp (B2B — future)**:
- Tips chuyên nghiệp hơn cho ứng viên từ link HR: "Chuẩn bị ngồi thẳng, micro rõ"
- Thêm branding công ty (tên + logo) trong loading screen nếu có

### Quy tắc Loading (từ UX Design doc):

| Thời gian chờ | Yêu cầu UX |
|----------------|-------------|
| > 2 giây | Loading spinner/indicator |
| > 10 giây | Progress bar + mô tả bước hiện tại |
| > 30 giây | Content giữ chân (tips, fun facts) + estimated time |

### Màn hình — CV Parsing Loading (xem chi tiết `08-UX-STUDENT-B2C.md` Màn 5)

```
┌──────────────────────────────────────────────────────────┐
│  Đang chuẩn bị buổi phỏng vấn cho bạn...               │
│  [████████████████░░░░░░░░░░] 60%                        │
│                                                           │
│  ✓ Đọc nội dung CV                                      │
│  ✓ Phân tích kỹ năng: React, TypeScript, Node.js        │
│  ⏳ Tạo 6 câu hỏi phỏng vấn riêng cho bạn...           │
│  ○ Chuẩn bị phiên phỏng vấn                              │
│                                                           │
│  💡 Mẹo: Ngồi nơi yên tĩnh, kiểm tra mic và camera    │
│  ⏱ Còn khoảng 20 giây                                   │
└──────────────────────────────────────────────────────────┘
```

### Màn hình — Connection Loading (xem chi tiết `08-UX-STUDENT-B2C.md` Màn 7)

```
┌──────────────────────────────────────────────────────────┐
│                    ◌ ◍ ●                                 │
│                                                           │
│          Đang kết nối với AI Interviewer...               │
│                                                           │
│  💡 Đây là không gian an toàn để bạn tập dượt.          │
│     Hãy thư giãn, ngồi thẳng và nhìn vào camera.       │
│     Bạn được phép sai — đó là mục đích của luyện tập!   │
└──────────────────────────────────────────────────────────┘
```

### Màn hình — Report Generation Loading (xem chi tiết `08-UX-STUDENT-B2C.md` Màn 9)

```
┌──────────────────────────────────────────────────────────┐
│  ✓ Phỏng vấn hoàn thành!                                │
│  Đang tạo báo cáo chi tiết...                           │
│  [■■■■■■■■■□□□□□□] 65%                                   │
│                                                           │
│  ✓ Phân tích nội dung câu trả lời                       │
│  ✓ Đánh giá từng câu hỏi                                │
│  ⏳ Phân tích ngôn ngữ cơ thể                            │
│  ○ Tổng hợp báo cáo cuối cùng                            │
│                                                           │
│  💡 Bạn biết không? Ứng viên trung bình dùng            │
│  12 từ đệm trong 1 buổi phỏng vấn.                     │
└──────────────────────────────────────────────────────────┘
```

### Files cần tạo/sửa

**web-app**:
- File mới: `src/components/interview/LoadingProgress.tsx` — Multi-step progress component (steps + tips)
- Sửa CV upload flow — hiển thị parsing progress
- Sửa interview room — connection loading với tips giảm lo lắng
- Sửa report page — scoring progress với fun facts
- Dùng skeleton loading cho report page khi đang generate

---

## 3.6 — Interview Room Layout

### Nghiệp vụ

**Sinh viên (B2C)**:
- Interview room giống video call thật (kỳ vọng 90.2% users)
- Phải có transcript panel real-time (user biết AI "nghe thấy" mình)
- Video feed luôn hiển thị (user cần thấy mình)
- Timer + question progress luôn visible
- Nút kết thúc rõ ràng nhưng không quá nổi bật (tránh bấm nhầm)

**Doanh nghiệp (B2B — future)**:
- Layout tương tự SV — ứng viên trải nghiệm giống nhau
- Có thể thêm branding công ty ở header nếu có

### Layout Desktop — 2 cột (xem chi tiết `08-UX-STUDENT-B2C.md` Màn 8)

```
┌──────────────────────────────────────────────────────────┐
│  InterviewPro    ⏱ 05:23    Câu 2/6 — Dự án tâm đắc    │
├────────────────────────────┬─────────────────────────────┤
│                            │                             │
│  ┌──────────────────────┐  │  Nội dung phỏng vấn        │
│  │                      │  │                             │
│  │    Self Video Feed   │  │  🤖 Minh: Xin chào!       │
│  │    (camera preview)  │  │  Hãy giới thiệu bản thân  │
│  │                      │  │  bạn nhé.                   │
│  └──────────────────────┘  │                             │
│                            │  👤 Bạn: Dạ em chào...     │
│  🎤 [Mic]  📹 [Camera]   │                             │
│  [⏹ Kết thúc phỏng vấn] │  [đang nói... ●]            │
├────────────────────────────┴─────────────────────────────┤
│  ⚡ Toast warning: "Nhìn vào camera nhé" — tự biến 3s  │
└──────────────────────────────────────────────────────────┘
```

### Layout Mobile — 1 cột (xem chi tiết `08-UX-STUDENT-B2C.md` Màn 8)

```
┌──────────────────────────┐
│  ⏱ 05:23   Câu 2/6      │
├──────────────────────────┤
│  ┌────────────────────┐  │
│  │   Self Video Feed  │  │
│  └────────────────────┘  │
│  🎤 [Mic] 📹 [Cam] 📝  │
│  [⏹ Kết thúc]          │
│  ── Kéo lên xem chat ── │
│  🤖 Dự án nào tâm đắc? │
│  👤 [đang nói... ●]     │
└──────────────────────────┘
```

### Nguyên tắc UX

1. Video feed luôn hiển thị (user cần thấy mình)
2. Transcript auto-scroll, partial text italic
3. Timer + question progress luôn visible
4. Nút kết thúc rõ ràng nhưng không quá nổi bật (tránh bấm nhầm)
5. Toast warnings ở góc, auto-dismiss 3 giây
6. Mobile: transcript ẩn mặc định, toggle bằng nút 📝

### Files cần tạo/sửa

**web-app**:
- Sửa `/interview/[sessionId]/room/page.tsx` — 2-column layout (desktop) / 1-column (mobile)
- File mới: `src/components/interview/InterviewLayout.tsx` — Responsive layout wrapper
- Integrate: TranscriptPanel (2.6) + InterviewTimer (3.2) + QuestionProgress (3.2) + VisionToast (3.3)

---

## Thứ tự thực hiện Phase 3

```
3.0 Onboarding flow              (web-app + core-backend)
    |
    +-> 3.1 Multi-step flow      (web-app) — cần onboarding trước
    |
    +-> 3.2 Timer + progress     (web-app + voice-agent) — song song
    |
    +-> 3.3 Vision warning UX    (web-app + vision-analytics) — song song
    |
    +-> 3.4 Audio quality        (voice-agent) — song song
    |
    +-> 3.5 Loading states       (web-app) — song song
         |
         +-> 3.6 Interview layout (web-app) — cần components từ 3.2, 3.3, 3.5
```
