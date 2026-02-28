# InterviewPro - Trạng thái dự án hiện tại

> Cập nhật: 2026-02-27

## Tổng quan kiến trúc

```
Browser (Next.js :3000)
  |--- REST/WS ---> core-backend (Spring Boot :8080) ---> PostgreSQL + Redis
  |--- WS audio --> voice-agent-service (Node.js :8081) <--> Gemini Multimodal Live API
  |--- WS landmarks -> vision-analytics-service (Python :8083)
                       core-backend --HTTP--> llm-orchestrator-service (Node.js :8082) --> Gemini API
```

## Trạng thái từng service

### 1. core-backend (Spring Boot 3 / Java 21) — 70% done

| Component | Status | Ghi chú |
|-----------|--------|---------|
| Auth (register/login/JWT) | DONE | BCrypt + JWT 24h |
| Session CRUD | DONE | Create, list, get, end |
| CV upload + parse | DONE | PDF/DOCX/TXT -> gọi llm-orchestrator |
| Question plan generation | DONE | Gọi llm-orchestrator sau parse CV |
| Interview dispatch | DONE | POST /internal/start-session tới voice-agent |
| Report retrieval | DONE | GET /api/v1/reports/session/{id} |
| DB migrations (V1-V6) | DONE | users, sessions, cv_profiles, reports, drop livekit |
| WebSocket config (STOMP) | CONFIG ONLY | Có config nhưng chưa có handler |
| WebSocket event handlers | NOT DONE | Chưa broadcast event |
| Report generation trigger | NOT DONE | Chưa gọi llm-orchestrator scoring |
| Transcript storage | NOT DONE | Không có bảng lưu transcript |
| Session state machine | PARTIAL | Thiếu LIVE -> ENDED -> SCORING -> REPORT_READY |
| Consent management | NOT DONE | |
| Redis caching | CONFIG ONLY | |
| Rate limiting | NOT DONE | |
| Tests | NOT DONE | |

### 2. web-app (Next.js 15 / React 19) — 60% done

| Component | Status | Ghi chú |
|-----------|--------|---------|
| Auth (login/register) | DONE | JWT localStorage |
| Dashboard | DONE | Tạo session + upload CV + history |
| Interview room | DONE | Audio + video + controls |
| Audio streaming | DONE | PCM 16kHz -> voice-agent WS |
| Face detection | DONE | MediaPipe + warnings |
| Stores (auth/session/transcript) | DONE | Zustand |
| Type definitions | DONE | session, events, cv, report |
| Consent page | NOT DONE | |
| Report page | NOT DONE | Types có nhưng chưa UI |
| Transcript panel | NOT DONE | Store có nhưng chưa render |
| User profile | NOT DONE | |
| Settings | NOT DONE | |
| Tests | NOT DONE | |

### 3. voice-agent-service (Node.js/TS) — 80% done

| Component | Status | Ghi chú |
|-----------|--------|---------|
| Gemini Live API proxy | DONE | Bidirectional audio |
| System prompt (Vietnamese HR) | DONE | "Minh" persona, 6 rules |
| Question plan support | DONE | Custom questions from CV |
| Speech metrics | DONE | WPM + filler words |
| Transcript callback | NOT DONE | Không gửi về core-backend |
| State notification | NOT DONE | Không notify LIVE/ENDED |
| Error recovery | NOT DONE | |

### 4. llm-orchestrator-service (Node.js/TS) — 90% done

| Component | Status | Ghi chú |
|-----------|--------|---------|
| CV parsing | DONE | |
| Question plan generation | DONE | |
| Turn scoring | DONE | /internal/scoring/turn |
| Final report generation | DONE | /internal/scoring/final |
| Gemini + retry logic | DONE | 3 retries |
| Zod validation | DONE | |

### 5. vision-analytics-service (Python/FastAPI) — 75% done

| Component | Status | Ghi chú |
|-----------|--------|---------|
| Eye contact detection | DONE | |
| Head pose estimation | DONE | |
| Warning emission | DONE | |
| Rolling window (30 frames) | DONE | |
| Warning cooldown | NOT DONE | Config exists, logic missing |
| Blink rate | NOT DONE | Hardcoded 15.0 |

## Insights từ khảo sát (123 người, Ý tưởng EXE.docx)

### Pain points chính (người dùng mục tiêu: SV 18-22)
- 69.1% tim đập nhanh/hồi hộp/run khi phỏng vấn
- 47.2% quên nội dung/đầu óc trống rỗng
- 56.9% thiếu tương tác thực tế
- 53.7% feedback chung chung, thiếu chiều sâu
- 39.8% dùng từ không chuyên nghiệp/nhiều từ đệm

### Top features mong muốn
1. Vặn hỏi xoáy sâu để rèn bản lĩnh (62.6%)
2. Chấm điểm + dự đoán tỷ lệ đậu (60.2%)
3. Gợi ý sửa câu trả lời chuyên nghiệp hơn (59.3%)
4. Soi lỗi cơ thể (43.1%)

### Pricing
- Sweet spot: 30,000 - 70,000 VND cho gói 3 ngày
- Anchor price: 49,000 VND
- 93.5% sẵn sàng sử dụng
- Bắt buộc có Free Trial

### Kỳ vọng từ personas
- **Ngọc (SV Kế toán)**: Không gian an toàn để tập dượt, feedback thẳng thắn, câu trả lời mẫu
- **Hà (SV Marketing)**: Feedback dựa trên số liệu (đếm từ đệm, tốc độ nói), progress tracking rõ ràng
- **Đạt (SV Tài chính)**: Tiêu chí chấm điểm minh bạch, app mượt không lag, sửa lỗi tức thì
- **HR (Linh, Thảo)**: AI hỗ trợ sàng lọc (không thay thế), AI chỉ tin 50% cho soft skills

### Customer Journey Moments of Truth
1. **Session đầu tiên** phải hoàn hảo — "1-2 lần thử để quyết định dùng tiếp"
2. **Report** phải cụ thể — "feedback chung chung → rời bỏ ngay"
3. **Progress** phải rõ ràng — "thấy tiến bộ thật → mua + truyền miệng"

### UX Design Documents
→ **B2C (Sinh viên)**: `plan/08-UX-STUDENT-B2C.md` — 13 màn hình chi tiết, cảm xúc user
→ **B2B (Doanh nghiệp)**: `plan/12-UX-BUSINESS-B2B.md` — HR dashboard, so sánh ứng viên
