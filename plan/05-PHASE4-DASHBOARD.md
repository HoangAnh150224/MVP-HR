# Phase 4: Dashboard + User Management — Chi tiết

> Goal: User thấy tiến bộ, muốn quay lại luyện tiếp
> Insight: "Cảm giác tiến bộ qua từng buổi" là động lực lớn nhất (khảo sát)
> Persona Hà: "giảm lỗi từ đệm từ 10 xuống 4" — progress tracking
> CJM Stage 3: "Progress & accountability: dashboard theo rubric, tracking theo session"
> CJM Stage 3: "Sẵn sàng sử dụng cao (93.5%) — điều kiện giữ chân là chứng minh cải thiện rõ ràng"
> Persona Hà: "Động lực lớn nhất là nhìn thấy các chỉ số lỗi giảm đi sau quá trình luyện tập"

---

## 4.1 — Dashboard Redesign

### Nghiệp vụ

**Sinh viên (B2C)**:
- Dashboard là "nhà" — nơi user thấy lịch sử, quick actions, và cảm giác tiến bộ
- Session cards hiển thị: role, date, state (color-coded), score
- Quick actions dựa trên state: "Xem báo cáo" nếu có report, "Phỏng vấn lại" nếu muốn retry
- CTA rõ ràng: "+ Tạo phỏng vấn mới" luôn nổi bật
- Hiển thị gói hiện tại + sessions còn lại trong tuần (free tier)

**Doanh nghiệp (B2B — future)**:
- HR có dashboard riêng (xem task 4.6) — không ảnh hưởng đến SV dashboard
- Ứng viên B2B không có dashboard (chỉ phỏng vấn + xem report cơ bản)

### Màn hình (xem chi tiết `08-UX-STUDENT-B2C.md` Màn 11)

```
┌──────────────────────────────────────────────────────────┐
│  InterviewPro    [📈 Tiến bộ]  [👤 Hồ sơ]  [Đăng xuất] │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Chào Ngọc! 👋                                           │
│  3 buổi phỏng vấn | Điểm TB: 74 | ↑ +9 điểm           │
│                                                           │
│  [+ Tạo phỏng vấn mới]                                  │
│                                                           │
│  ┌─ Session mới nhất ──────────────────────────────┐     │
│  │  Frontend Developer — Junior       Hôm nay       │     │
│  │  ● Có báo cáo                     78/100         │     │
│  │  [Xem báo cáo]  [Phỏng vấn lại]                 │     │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─ Session trước ─────────────────────────────────┐     │
│  │  Frontend Developer — Junior       25/02         │     │
│  │  ● Có báo cáo                     72/100         │     │
│  │  [Xem báo cáo]                                    │     │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  Gói: Miễn phí | Còn 1 buổi tuần này                    │
│  [Nâng cấp — 49,000đ/3 ngày]                            │
└──────────────────────────────────────────────────────────┘
```

### Session Card States

| State | Color | Badge | Actions |
|-------|-------|-------|---------|
| CREATED / CV_UPLOADING | Gray | "Đang chuẩn bị" | Tiếp tục |
| LIVE / JOINING | Blue | "Đang phỏng vấn" | Vào phòng |
| SCORING | Yellow | "Đang tạo report" | Chờ |
| REPORT_READY | Green | "Có báo cáo" + Score | Xem báo cáo, Phỏng vấn lại |

### Files cần tạo/sửa

**web-app**:
- File mới: `src/components/dashboard/SessionCard.tsx` — Card with state color, score, actions
- Sửa `src/app/dashboard/page.tsx` — New layout: header stats + CTA + session list + tier info

---

## 4.2 — Session Detail Page

### Nghiệp vụ

**Sinh viên (B2C)**:
- Xem chi tiết 1 session: timeline trạng thái, transcript tab, report tab
- User có thể quay lại xem transcript và report bất cứ lúc nào
- Actions: phỏng vấn lại (tạo session mới cùng role/level), xóa session

**Doanh nghiệp (B2B — future)**:
- HR xem session detail của ứng viên kèm metrics per turn (xem `12-UX-BUSINESS-B2B.md` Màn 7)
- HR có thêm: ghi chú, đánh giá (Mời/Cân nhắc/Từ chối)

### Màn hình

```
┌──────────────────────────────────────────────────────────┐
│  Session: Frontend Developer — Junior    26/02/2026      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Timeline:                                                │
│  ● Tạo 14:00 → ● CV parsed 14:01 → ● Live 14:02        │
│  → ● Ended 14:18 → ● Report 14:19                       │
│                                                           │
│  [Tab: Transcript]  [Tab: Báo cáo]                       │
│                                                           │
│  ┌─ Transcript ─────────────────────────────────────┐    │
│  │  🤖 Minh (00:00): Chào bạn, giới thiệu...       │    │
│  │  👤 Bạn (00:15): Dạ em chào anh...               │    │
│  │  ...                                               │    │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  [🔄 Phỏng vấn lại]  [🗑 Xóa session]                  │
└──────────────────────────────────────────────────────────┘
```

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | /api/v1/sessions/{id} | Bearer token | — | Session (full details) |
| GET | /api/v1/sessions/{id}/transcripts | Bearer token | — | TranscriptTurn[] |
| GET | /api/v1/reports/session/{id} | Bearer token | — | Report |
| DELETE | /api/v1/sessions/{id} | Bearer token | — | 204 No Content |

### Files cần tạo/sửa

**web-app**:
- File mới: `src/app/dashboard/sessions/[id]/page.tsx` — Session detail with tabs
- File mới: `src/components/dashboard/SessionTimeline.tsx` — State timeline visualization

---

## 4.3 — Progress Tracking

### Nghiệp vụ

**Sinh viên (B2C)**:
- MOTIVATION #1: User thấy tiến bộ qua thời gian → muốn luyện tiếp
- Persona Hà: "muốn thấy lỗi giảm từ 10 xuống 4 qua các lần tập"
- Charts: score trend, filler words trend, eye contact trend
- Celebration messages cho MỌI tiến bộ dù nhỏ: "Từ đệm giảm 58%!"
- Empty state: "Cần ít nhất 2 buổi để theo dõi tiến bộ. Bắt đầu ngay!"

**Doanh nghiệp (B2B — future)**:
- HR KHÔNG cần progress tracking — HR xem snapshot 1 lần của ứng viên
- Progress tracking chỉ cho SV B2C (luyện nhiều lần)

### Màn hình (xem chi tiết `08-UX-STUDENT-B2C.md` Màn 12)

```
┌──────────────────────────────────────────────────────────┐
│  📈 Tiến bộ của bạn                     [← Dashboard]    │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Tổng: 3 buổi  |  Điểm TB: 74/100  |  ↑ +9 so với đầu │
│                                                           │
│  ┌─ Điểm qua từng buổi ──────────────────────────┐      │
│  │  80 ┤                          ●               │      │
│  │  75 ┤              ●                            │      │
│  │  65 ┤  ●                                        │      │
│  │     └──────────────────────────────             │      │
│  │      24/02      25/02       26/02               │      │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  🎉 Điểm tăng 20% so với lần đầu!                       │
│                                                           │
│  ┌─ Từ đệm ─────────────────────────────────────┐       │
│  │  12 → 8 → 5                                    │       │
│  └───────────────────────────────────────────────────┘    │
│  🎉 Từ đệm giảm 58%! Từ 12 xuống còn 5.                │
│                                                           │
│  ┌─ Giao tiếp mắt ──────────────────────────────┐       │
│  │  55% → 65% → 72%                               │       │
│  └───────────────────────────────────────────────────┘    │
│  👁 Giao tiếp mắt tăng từ 55% lên 72%!                  │
└──────────────────────────────────────────────────────────┘
```

### Nguyên tắc UX

1. **Celebration messages** cho MỌI tiến bộ dù nhỏ — positive reinforcement
2. **Trend arrows** (↑↓) rõ ràng
3. **So sánh với lần đầu** — cho user thấy bao xa đã đi
4. Charts đơn giản (line chart), không phức tạp
5. **Empty state**: "Cần ít nhất 2 buổi phỏng vấn để theo dõi tiến bộ. Bắt đầu ngay!"

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | /api/v1/users/me/statistics | Bearer token | — | UserStatistics |

```json
{
  "totalSessions": 5,
  "completedSessions": 4,
  "avgScore": 75,
  "recentScores": [65, 70, 72, 78, 80],
  "trend": "+8",
  "avgFillerWords": [12, 10, 8, 7, 5],
  "avgEyeContact": [60, 65, 68, 72, 75],
  "improvements": {
    "fillerWordsReduction": "58%",
    "eyeContactIncrease": "20%",
    "scoreIncrease": "+15"
  }
}
```

### Files cần tạo/sửa

**core-backend**:
- File mới: `StatisticsController.java` — GET /api/v1/users/me/statistics
- File mới: `StatisticsService.java` — Aggregate scores, filler words, eye contact across sessions

**web-app**:
- File mới: `src/app/dashboard/progress/page.tsx` — Progress tracking page
- File mới: `src/components/dashboard/ProgressChart.tsx` — Line charts (recharts) + celebrations

---

## 4.4 — User Profile

### Nghiệp vụ

**Sinh viên (B2C)**:
- Edit tên, đổi mật khẩu
- Xem thống kê: tổng sessions, điểm TB, subscription tier
- Quản lý dữ liệu: xóa tài khoản (GDPR-like)

**Doanh nghiệp (B2B — future)**:
- HR profile: edit name, company info
- Ứng viên B2B: không có profile (phỏng vấn 1 lần qua invite link)

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | /api/v1/users/me | Bearer token | — | UserProfile |
| PUT | /api/v1/users/me | Bearer token | {name} | UserProfile |
| PUT | /api/v1/users/me/password | Bearer token | {currentPassword, newPassword} | 204 |

### Files cần tạo/sửa

**web-app**:
- File mới: `src/app/dashboard/profile/page.tsx` — Edit name, change password, stats summary

**core-backend**:
- File mới: `UserProfileController.java` — GET/PUT profile, PUT password

---

## 4.5 — Device Settings

### Nghiệp vụ

**Sinh viên (B2C)**:
- Test mic + camera TRƯỚC khi bắt đầu phỏng vấn
- Chọn mic/camera nếu có nhiều device
- Audio level meter: user thấy mình nói có nghe thấy không
- Lưu preferences vào localStorage

**Doanh nghiệp (B2B — future)**:
- Tương tự SV — ứng viên cũng cần test device trước phỏng vấn

### Màn hình

```
┌──────────────────────────────────────────────────────────┐
│  Cài đặt thiết bị                        [← Dashboard]   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  🎤 Microphone:                                          │
│  [Built-in Microphone                           ▾]       │
│  [████████████░░░░░░░░] Level: OK                        │
│  [Test mic]                                               │
│                                                           │
│  📹 Camera:                                              │
│  [Integrated Webcam                             ▾]       │
│  ┌────────────────────────────┐                          │
│  │    [Camera preview]        │                          │
│  └────────────────────────────┘                          │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Files cần tạo/sửa

**web-app**:
- File mới: `src/app/dashboard/settings/page.tsx` — Device settings page
- Dùng `navigator.mediaDevices.enumerateDevices()` cho mic/camera list
- Audio level meter: `AudioContext` + `AnalyserNode`
- Lưu selected devices vào localStorage

---

## 4.6 — HR Dashboard (B2B — future)

### Nghiệp vụ

**Doanh nghiệp (B2B)**:
- HR đăng nhập → thấy dashboard riêng (không phải SV dashboard)
- Tổng quan: số vị trí đang tuyển, tổng ứng viên, điểm TB, % đạt
- Danh sách vị trí tuyển dụng → click vào → danh sách ứng viên
- Quick actions: Tạo vị trí mới, Gửi link mời, Xuất báo cáo
- Pilot info: hiển thị ngày còn lại, số UV còn lại

### Màn hình (xem chi tiết `12-UX-BUSINESS-B2B.md` Màn 2)

```
┌──────────────────────────────────────────────────────────┐
│  InterviewPro — HR Dashboard    [Tạo vị trí mới]        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Xin chào, Linh!    FPT Software — Pilot (25 ngày còn)  │
│                                                           │
│  ┌─ TỔNG QUAN ───────────────────────────────────────┐   │
│  │  Vị trí đang tuyển: 2                             │   │
│  │  Ứng viên đã phỏng vấn AI: 8                     │   │
│  │  Điểm trung bình: 68/100                          │   │
│  │  Ứng viên đạt (>70): 5/8 (62.5%)                 │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─ VỊ TRÍ: Frontend Developer (Junior) ────────────┐   │
│  │  4 ứng viên | Điểm TB: 72 | Tạo: 20/02          │   │
│  │                                                    │   │
│  │  Ứng viên       Điểm   KT    GT    STAR          │   │
│  │  Ngọc N.H.      78     80    72    3/4            │   │
│  │  Hà T.T.        72     75    65    2/4            │   │
│  │  Đạt V.M.       68     70    60    2/4            │   │
│  │  Minh P.Q.      58     55    62    1/4            │   │
│  │                                                    │   │
│  │  [Xem chi tiết]  [Xuất Excel]  [Gửi link thêm]  │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─ VỊ TRÍ: BA Intern ──────────────────────────────┐   │
│  │  4 ứng viên | Điểm TB: 64 | Tạo: 22/02          │   │
│  │  [Xem chi tiết]                                    │   │
│  └───────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### Database

```sql
-- V10__create_organizations_table.sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,    -- URL-friendly: "fpt-software"
    logo_url VARCHAR(500),
    subscription_tier VARCHAR(50) DEFAULT 'pilot',  -- pilot, standard, enterprise
    pilot_start_date DATE,
    pilot_end_date DATE,
    max_candidates_per_month INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- V11__create_org_members_table.sql
CREATE TABLE org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) NOT NULL DEFAULT 'hr',  -- admin, hr
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, user_id)
);
CREATE INDEX idx_org_members_org ON org_members(organization_id);
CREATE INDEX idx_org_members_user ON org_members(user_id);
```

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | /api/v1/organizations/me | Bearer token (HR) | — | Organization + stats |
| GET | /api/v1/organizations/me/positions | Bearer token (HR) | — | Position[] with candidate counts |
| GET | /api/v1/organizations/me/positions/{id}/candidates | Bearer token (HR) | — | Candidate[] with scores |

### Files cần tạo/sửa

**core-backend**:
- File mới: `Organization.java` — Entity
- File mới: `OrgMember.java` — Entity
- File mới: `OrganizationRepository.java`
- File mới: `OrganizationController.java` — HR dashboard APIs
- File mới: `OrganizationService.java` — Business logic + stats aggregation
- Migration: `V10__create_organizations_table.sql`, `V11__create_org_members_table.sql`

**web-app**:
- File mới: `src/app/hr/dashboard/page.tsx` — HR dashboard
- File mới: `src/components/hr/PositionCard.tsx` — Position summary card
- File mới: `src/components/hr/CandidateRow.tsx` — Candidate row in table
- File mới: `src/stores/hrStore.ts` — Zustand store cho HR state

---

## 4.7 — Create Position (B2B — future)

### Nghiệp vụ

**Doanh nghiệp (B2B)**:
- HR tạo vị trí tuyển dụng: tên + level + JD (tùy chọn) + tiêu chí đánh giá (trọng số)
- Hệ thống generate invite link → HR gửi cho ứng viên
- HR có thể gửi email mời trực tiếp (nhập danh sách email)
- Giới hạn ứng viên tối đa per vị trí (theo gói subscription)

### Màn hình — Tạo vị trí (xem chi tiết `12-UX-BUSINESS-B2B.md` Màn 3)

```
┌──────────────────────────────────────────────────────────┐
│  Tạo vị trí phỏng vấn mới                               │
│                                                           │
│  📋 Tên vị trí:                                          │
│  [Frontend Developer                               ]     │
│                                                           │
│  📊 Cấp độ:                                              │
│  [Junior (1-2 năm)                              ▾]       │
│                                                           │
│  📝 Mô tả công việc (JD) — không bắt buộc:              │
│  ┌────────────────────────────────────────────────┐      │
│  │  Dán JD vào đây để AI tạo câu hỏi sát thực   │      │
│  │  tế hơn. Không có JD → AI dùng câu hỏi chuẩn │      │
│  └────────────────────────────────────────────────┘      │
│                                                           │
│  🎯 Tiêu chí đánh giá (chọn trọng số):                  │
│  ☑ Kỹ thuật / Chuyên môn        ████████░░ 40%          │
│  ☑ Giao tiếp / Phong thái       ██████░░░░ 30%          │
│  ☑ Tư duy logic / Giải quyết    ████░░░░░░ 20%          │
│  ☑ Phù hợp văn hóa              ██░░░░░░░░ 10%          │
│                                                           │
│  📩 Số ứng viên tối đa: [20]                            │
│                                                           │
│  [Tạo và lấy link gửi ứng viên →]                       │
└──────────────────────────────────────────────────────────┘
```

### Màn hình — Invite Link (xem chi tiết `12-UX-BUSINESS-B2B.md` Màn 3)

```
┌──────────────────────────────────────────────────────────┐
│  ✓ Vị trí "Frontend Developer — Junior" đã tạo!         │
│                                                           │
│  Gửi link này cho ứng viên:                              │
│  ┌────────────────────────────────────────────┐          │
│  │  https://interviewpro.vn/apply/abc123      │          │
│  │                                  [Sao chép]│          │
│  └────────────────────────────────────────────┘          │
│                                                           │
│  Hoặc gửi email mời:                                     │
│  [email1@gmail.com                                  ]    │
│  [email2@gmail.com                                  ]    │
│  [Gửi email mời]                                         │
└──────────────────────────────────────────────────────────┘
```

### Database

```sql
-- V12__create_positions_table.sql
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    title VARCHAR(255) NOT NULL,             -- "Frontend Developer"
    level VARCHAR(50) NOT NULL,              -- "junior", "mid", "senior"
    job_description TEXT,                     -- JD text (optional)
    scoring_weights JSONB NOT NULL DEFAULT '{"technical":40,"communication":30,"problemSolving":20,"culturalFit":10}',
    max_candidates INTEGER DEFAULT 20,
    status VARCHAR(50) DEFAULT 'active',     -- active, closed
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_positions_org ON positions(organization_id);

-- V13__create_invitations_table.sql
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID NOT NULL REFERENCES positions(id),
    code VARCHAR(20) UNIQUE NOT NULL,        -- Short code: "abc123"
    candidate_name VARCHAR(255),
    candidate_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',    -- pending, completed, expired
    session_id UUID REFERENCES sessions(id), -- Linked session after interview
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ
);
CREATE INDEX idx_invitations_position ON invitations(position_id);
CREATE INDEX idx_invitations_code ON invitations(code);
```

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | /api/v1/positions | Bearer token (HR) | {title, level, jobDescription?, scoringWeights, maxCandidates} | Position + inviteLink |
| GET | /api/v1/positions/{id} | Bearer token (HR) | — | Position + stats |
| PUT | /api/v1/positions/{id} | Bearer token (HR) | {title?, level?, jobDescription?, scoringWeights?} | Position |
| POST | /api/v1/positions/{id}/invitations | Bearer token (HR) | {emails: string[]} | Invitation[] |
| GET | /api/v1/invitations/{code} | No auth | — | {positionTitle, level, organizationName} |

### Files cần tạo/sửa

**core-backend**:
- File mới: `Position.java` — Entity
- File mới: `Invitation.java` — Entity
- File mới: `PositionRepository.java`
- File mới: `InvitationRepository.java`
- File mới: `PositionController.java` — CRUD positions + generate invitations
- File mới: `InvitationController.java` — Public endpoint: GET invitation info
- File mới: `PositionService.java` — Business logic
- File mới: `EmailService.java` — Send invitation emails
- Migrations: `V12__create_positions_table.sql`, `V13__create_invitations_table.sql`

**web-app**:
- File mới: `src/app/hr/positions/new/page.tsx` — Create position form
- File mới: `src/app/hr/positions/[id]/page.tsx` — Position detail + candidates
- File mới: `src/components/hr/InviteLinkModal.tsx` — Copy link + send emails

---

## 4.8 — Candidate Comparison (B2B — future)

### Nghiệp vụ

**Doanh nghiệp (B2B)**:
- HR so sánh ứng viên trong cùng 1 vị trí side-by-side
- Bảng so sánh: tổng điểm, tiêu chí, STAR, từ đệm, eye contact
- Color-coded: ✓ Đề xuất mời (>75), ~ Cân nhắc (60-75), ✗ Chưa đạt (<60)
- HR ghi chú + quyết định per ứng viên
- Xuất báo cáo tổng hợp (Excel/PDF)

### Màn hình (xem chi tiết `12-UX-BUSINESS-B2B.md` Màn 6)

```
┌──────────────────────────────────────────────────────────┐
│  So sánh ứng viên — Frontend Developer (Junior)          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│              Ngọc N.H.   Hà T.T.   Đạt V.M.  Minh P.Q. │
│  ────────────────────────────────────────────────────     │
│  TỔNG ĐIỂM   78 ✓       72 ✓      68 ~       58 ✗      │
│  Kỹ thuật    80          75        70          55        │
│  Giao tiếp   72          65        60          62        │
│  Tư duy      75          78        72          55        │
│  STAR        3/4         2/4       2/4         1/4       │
│  Từ đệm      8          12         6          15        │
│  Eye contact 68%         55%       72%         45%       │
│  ────────────────────────────────────────────────────     │
│  HR đánh giá  Mời        Cân nhắc  Cân nhắc   Từ chối   │
│                                                           │
│  ✓ = Đề xuất mời (>75)  ~ = Cân nhắc (60-75)           │
│  ✗ = Chưa đạt (<60)                                      │
│                                                           │
│  [Xuất báo cáo tổng hợp]                                │
└──────────────────────────────────────────────────────────┘
```

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | /api/v1/positions/{id}/comparison | Bearer token (HR) | — | CandidateComparison[] |
| POST | /api/v1/positions/{id}/candidates/{candidateId}/evaluation | Bearer token (HR) | {decision, notes} | Evaluation |
| GET | /api/v1/positions/{id}/export | Bearer token (HR) | ?format=excel\|pdf | File download |

### Database

```sql
-- V14__create_hr_evaluations_table.sql
CREATE TABLE hr_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id),
    evaluator_id UUID NOT NULL REFERENCES users(id),       -- HR user
    decision VARCHAR(50) NOT NULL,                          -- 'invite', 'consider', 'reject'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(session_id, evaluator_id)
);
CREATE INDEX idx_evaluations_session ON hr_evaluations(session_id);
```

### Files cần tạo/sửa

**core-backend**:
- File mới: `HrEvaluation.java` — Entity
- File mới: `HrEvaluationRepository.java`
- File mới: `ComparisonController.java` — GET comparison, POST evaluation, GET export
- File mới: `ExportService.java` — Generate Excel/PDF reports

**web-app**:
- File mới: `src/app/hr/positions/[id]/comparison/page.tsx` — Comparison table
- File mới: `src/components/hr/ComparisonTable.tsx` — Side-by-side comparison
- File mới: `src/components/hr/EvaluationForm.tsx` — Decision + notes per candidate
- File mới: `src/components/hr/CandidateReport.tsx` — HR view of candidate report (kèm disclaimer)

---

## Thứ tự thực hiện Phase 4

```
B2C (ưu tiên):
4.1 Dashboard redesign    (web-app)
    |
    +-> 4.2 Session detail    (web-app + core-backend)
    +-> 4.3 Progress tracking (web-app + core-backend)
    +-> 4.4 User profile      (web-app + core-backend)
    +-> 4.5 Device settings   (web-app) — song song, không dependency

B2B (future, sau khi 500+ users B2C):
4.6 HR Dashboard           (core-backend + web-app) — cần DB schemas
    |
    +-> 4.7 Create Position   (core-backend + web-app) — cần organizations + positions
         |
         +-> 4.8 Comparison   (core-backend + web-app) — cần invitations + evaluations
```
