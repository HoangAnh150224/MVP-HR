# InterviewPro - Kế hoạch phát triển tổng thể

> Mục tiêu MVP: User hoàn thành 1 interview từ đầu đến cuối, nhận report actionable, và thấy tiến bộ.
> Target: 500 users đầu tiên (SOM từ business plan)
> B2B: Bắt đầu sau khi có 500+ users B2C

## Nguyên tắc ưu tiên

1. **End-to-end flow trước** — Nối service lại thành flow hoàn chỉnh
2. **Feedback chất lượng** — Report phải actionable, không chung chung (pain #1 từ khảo sát)
3. **Trải nghiệm "giống thật"** — Video call tự nhiên, vặn hỏi sâu (62.6% mong muốn)
4. **Freemium model** — Free Trial chất lượng, upsell gói 49k/3 ngày
5. **B2B sau MVP** — HR dashboard, invite link, so sánh ứng viên (future)

---

## Phase 1: E2E Flow — Hoàn thiện vòng lặp chính

> User tạo session -> upload CV -> consent -> phỏng vấn -> nhận report
> Đây là BLOCKING cho mọi thứ khác.

| Task | Service | Chi tiết |
|------|---------|----------|
| 1.1 Transcript storage | core-backend + voice-agent | Tạo bảng transcripts, voice-agent gửi callback |
| 1.2 Session state machine | core-backend + voice-agent | Enforce transitions, notify LIVE/ENDED |
| 1.3 Scoring + Report flow | core-backend | ENDED -> score turns -> final report -> REPORT_READY |
| 1.4 WebSocket events | core-backend + web-app | Broadcast state changes, transcript, report.ready |
| 1.5 Report page | web-app | Hiển thị scores + feedback + improvements |
| 1.6 Consent screen | web-app + core-backend | Privacy gate bắt buộc trước interview |

**Kết quả Phase 1**: Flow hoàn chỉnh từ đầu đến cuối, user nhận được report.

---

## Phase 2: Feedback chất lượng — Khác biệt so với ChatGPT

> Giải quyết pain: "feedback chung chung" (53.7%) và "thiếu tương tác thực tế" (56.9%)
> Đây là Moment of Truth — quyết định user có quay lại không.

| Task | Service | Chi tiết |
|------|---------|----------|
| 2.1 Speech metrics trong report | voice-agent + core-backend | WPM, filler words count, silence duration |
| 2.2 STAR analysis | llm-orchestrator | Identify missing S/T/A/R components per answer |
| 2.3 Sample answers | llm-orchestrator | Gợi ý câu trả lời mẫu tốt hơn cho mỗi câu |
| 2.4 Vision metrics trong report | vision-analytics + core-backend | Eye contact %, head pose stats, fidgeting count |
| 2.5 Report page v2 | web-app | Rich report: scores + STAR + metrics + sample answers |
| 2.6 Real-time transcript panel | web-app | Hiển thị conversation live trong interview room |

**Kết quả Phase 2**: Report actionable với số liệu cụ thể, câu trả lời mẫu, STAR analysis.

---

## Phase 3: Interview UX — Trải nghiệm mượt mà

> Giải quyết: "ứng dụng phải mượt, đừng đơ lag" (insight từ persona Đạt)
> Và: "giao diện giống video call thật" (90.2% kỳ vọng)
> Và: Session đầu tiên phải hoàn hảo (Moment of Truth — CJM Stage 2)

| Task | Service | Chi tiết |
|------|---------|----------|
| 3.0 Onboarding flow | web-app + core-backend | B2C: role + level + CV. B2B: invite link → tên/email |
| 3.1 Interview multi-step flow | web-app | Tách: upload → consent → room → report |
| 3.2 Interview timer + progress | web-app + voice-agent | Timer + "Câu 2/6" indicator |
| 3.3 Vision warning UX | web-app + vision-analytics | Toast thay overlay, cooldown 5s |
| 3.4 Audio quality improvement | voice-agent | Auto-reconnect Gemini, buffer management |
| 3.5 Loading states | web-app | Multi-step progress + tips khi chờ |
| 3.6 Interview room layout | web-app | 2-col: video + transcript, responsive |

**Kết quả Phase 3**: Trải nghiệm interview smooth, professional, giống video call thật.

---

## Phase 4: Dashboard + User Management

> Cho user quay lại, thấy progress, và muốn dùng tiếp.
> B2B: HR dashboard, tạo vị trí, so sánh ứng viên.

| Task | Service | Chi tiết |
|------|---------|----------|
| 4.1 Dashboard redesign | web-app | Session cards, filter, quick actions |
| 4.2 Session detail page | web-app + core-backend | Transcript viewer + report summary |
| 4.3 Progress tracking | web-app + core-backend | Score trend chart across sessions |
| 4.4 User profile | web-app + core-backend | Edit name, interview statistics |
| 4.5 Device settings | web-app | Mic/camera selection + test |
| **4.6 HR Dashboard** | **core-backend + web-app** | **B2B: list vị trí, ứng viên, scores, tổng quan** |
| **4.7 Create Position** | **core-backend + web-app** | **B2B: tạo vị trí + JD + tiêu chí + invite link** |
| **4.8 Candidate Comparison** | **core-backend + web-app** | **B2B: so sánh ứng viên side-by-side + HR đánh giá** |

**Kết quả Phase 4**: SV thấy tiến bộ, muốn quay lại. HR quản lý ứng viên hiệu quả.

---

## Phase 5: Monetization + Growth

> Freemium model theo khảo sát: free trial -> 49k/3 ngày (B2C)
> B2B: Pilot miễn phí → Standard → Enterprise

| Task | Service | Chi tiết |
|------|---------|----------|
| 5.1 Pricing tiers | core-backend + web-app | B2C: Free/49k/99k. B2B: Pilot/Standard/Enterprise |
| 5.2 Payment integration | core-backend | MoMo/ZaloPay/bank QR (B2C). Invoice (B2B) |
| 5.3 Shareable scorecard | web-app + core-backend | B2C: PNG share Facebook. B2B: PDF export cho HR |
| 5.4 Referral system | core-backend + web-app | Mời bạn = thêm sessions miễn phí |
| 5.5 Landing page | web-app | B2C: so sánh ChatGPT. B2B: ROI + demo |
| **5.6 B2B Pricing & Subscription** | **core-backend + web-app** | **B2B: Pilot → Standard → Enterprise tiers** |

**Kết quả Phase 5**: Mô hình kinh doanh B2C + B2B hoạt động.

---

## Phase 6: Production Readiness

| Task | Service | Chi tiết |
|------|---------|----------|
| 6.1 Security hardening | all | CORS, rate limiting, input sanitization, multi-tenant isolation (B2B) |
| 6.2 Internal auth | all | API key cho /internal/ endpoints. Org API keys (B2B Enterprise) |
| 6.3 Error handling | all | Circuit breaker, graceful degradation, SLA (B2B) |
| 6.4 Testing | all | Unit + integration + E2E. B2B: invite → interview → HR report |
| 6.5 Monitoring | all | Health checks, structured logging, per-org usage tracking (B2B) |
| 6.6 API documentation | core-backend | Swagger/OpenAPI, B2B integration guide, webhook docs |

---

## Dependency Graph

```
Phase 1 (E2E Flow) ← CRITICAL PATH — tất cả phụ thuộc Phase 1
    |
    +---> Phase 2 (Feedback quality)
    |         |
    |         +---> Phase 5 (Monetization — B2C)
    |
    +---> Phase 3 (Interview UX)
    |
    +---> Phase 4 (Dashboard — B2C: 4.1-4.5)
    |
    +---> Phase 6 (Production) — song song với Phase 3-5

B2B Dependencies (future, sau 500+ users B2C):
    Phase 4.6 (HR Dashboard) ← cần organizations DB
        |
        +---> Phase 4.7 (Create Position) ← cần positions + invitations DB
        |         |
        |         +---> Phase 4.8 (Candidate Comparison) ← cần evaluations DB
        |
        +---> Phase 5.6 (B2B Pricing) ← cần organizations từ 4.6
```

## Mapping features với khảo sát

| Nhu cầu khảo sát | Phase | Task |
|-------------------|-------|------|
| Vặn hỏi xoáy sâu (62.6%) | Đã có | voice-agent system prompt đã hỗ trợ |
| Chấm điểm (60.2%) | Phase 1 | 1.3 + 1.5 |
| Sửa câu trả lời (59.3%) | Phase 2 | 2.3 Sample answers |
| Soi lỗi cơ thể (43.1%) | Phase 2 | 2.4 Vision metrics |
| Feedback cụ thể, số liệu | Phase 2 | 2.1 + 2.2 + 2.5 |
| Giao diện giống video call thật | Phase 3 | 3.1 + 3.5 + 3.6 |
| Onboarding nhanh, ít friction | Phase 3 | 3.0 Onboarding flow |
| Progress tracking | Phase 4 | 4.3 |
| Giá 49k/3 ngày | Phase 5 | 5.1 + 5.2 |
| Free Trial | Phase 5 | 5.1 |
| Privacy/consent | Phase 1 | 1.6 |
| STAR method | Phase 2 | 2.2 |
| Minh bạch tiêu chí chấm điểm | Phase 1 | 1.5 Report page (rubric link) |
| So sánh với ChatGPT | Phase 5 | 5.5 Landing page comparison |

## Mapping với Customer Journey Map

| CJM Stage | Pain Point | Solution | Phase |
|-----------|-----------|----------|-------|
| Pre-purchase: Consider | "Khác ChatGPT ở đâu?" | Landing page comparison | 5.5 |
| Pre-purchase: Explore | "Feedback có cụ thể không?" | Sample report trên landing | 5.5 |
| Pre-purchase: Compare | "Có đáng tiền không?" | Free trial, pricing page | 5.1 |
| Purchase: First session | "Session đầu PHẢI hoàn hảo" | Onboarding + loading UX | 3.0, 3.5 |
| Purchase: Report | "Feedback chung chung → rời bỏ" | Actionable report + checklist | 1.5, 2.5 |
| Post-purchase: Progress | "Cần thấy tiến bộ" | Progress charts + celebrations | 4.3 |
| Post-purchase: Sharing | "Artifact shareable" | Scorecard PNG + share | 5.3 |

## Mapping B2B với HR Journey (từ `12-UX-BUSINESS-B2B.md`)

| HR Journey Stage | Pain Point | Solution | Phase |
|-----------------|-----------|----------|-------|
| Discover | "AI có đánh giá được soft skills?" | Landing B2B + trust section | 5.5 |
| Trial | "Thử xem có tiện không" | Pilot 30 ngày miễn phí | 5.6 |
| Create Position | "Tạo bộ câu hỏi cho vị trí" | Position + JD + tiêu chí | 4.7 |
| Invite Candidate | "Gửi link cho ứng viên" | Invite link + email mời | 4.7 |
| Review Report | "Xem kết quả, so sánh" | HR report + comparison | 4.6, 4.8 |
| Buy | "Đề xuất công ty mua gói" | Standard/Enterprise pricing | 5.6 |

## UX Design Documents

Chi tiết trải nghiệm từng màn hình, mockups, cảm xúc user:
→ **B2C (Sinh viên)**: `08-UX-STUDENT-B2C.md` — 13 màn hình từ landing → report → progress
→ **B2B (Doanh nghiệp/HR)**: `12-UX-BUSINESS-B2B.md` — 7 màn hình HR dashboard + ứng viên
