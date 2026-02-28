# Phase 5: Monetization + Growth — Chi tiết

> Pricing từ khảo sát:
> - Sweet spot: 30,000 - 70,000 VND cho gói 3 ngày
> - Anchor price: 49,000 VND
> - 93.5% sẵn sàng sử dụng
> - BẮT BUỘC có Free Trial chất lượng (insight từ cả 3 personas SV)
>
> Model: Freemium (free tier + paid tiers) cho B2C
> Model: Pilot miễn phí → gói team cho B2B

---

## 5.1 — Pricing Tiers

### Nghiệp vụ

**Sinh viên (B2C)**:
- Free: 2 sessions/tuần, basic report (score + feedback) — đủ để trải nghiệm giá trị
- Cấp tốc 3 ngày: 49,000đ, unlimited sessions, full report (STAR + sample answers + vision metrics)
- Monthly: 99,000đ/tháng, mọi thứ + progress tracking + priority support
- Free Trial PHẢI chất lượng — user phải thấy giá trị ngay lần đầu, chỉ upsell khi hit limit
- Upsell moment: khi hết lượt free → show progress đã đạt + "nâng cấp để tiếp tục"

**Doanh nghiệp (B2B — future)**:
- Pilot miễn phí 30 ngày: 5 ứng viên, 1 vị trí, report cơ bản
- Standard: liên hệ báo giá, 20+ ứng viên/tháng, nhiều vị trí, full report
- Enterprise: custom, API integration, ATS kết nối, SLA
- B2B pricing riêng biệt, không hiện trên pricing page SV (xem task 5.6)

### Bảng tiers B2C

| Tier | Giá | Giới hạn | Features |
|------|-----|----------|----------|
| Free | 0đ | 2 sessions/tuần | Basic report (score + feedback + top 3 ưu tiên sửa) |
| Cấp tốc 3 ngày | 49,000đ | Unlimited 3 ngày | Full report + STAR + sample answers + vision metrics |
| Monthly | 99,000đ/tháng | Unlimited | All features + progress tracking + priority support |

### Bảng tiers B2B (xem task 5.6 cho chi tiết)

| Tier | Giá | Giới hạn |
|------|-----|----------|
| Pilot | 0đ / 30 ngày | 5 ứng viên, 1 vị trí |
| Standard | Liên hệ | 20+ ứng viên/tháng, nhiều vị trí |
| Enterprise | Custom | API, ATS integration, SLA |

### Database

```sql
-- V9__create_subscriptions_table.sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),  -- NULL for B2C
    tier VARCHAR(50) NOT NULL,                           -- free, rapid_3day, monthly, pilot, standard, enterprise
    status VARCHAR(50) DEFAULT 'active',                 -- active, expired, cancelled
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    max_sessions_per_week INTEGER,                       -- NULL = unlimited
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CHECK (user_id IS NOT NULL OR organization_id IS NOT NULL)
);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
```

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | /api/v1/subscriptions/me | Bearer token | — | Subscription + usage |
| POST | /api/v1/subscriptions | Bearer token | {tier, paymentMethod?} | Subscription |

### Luồng kiểm tra tier

```
User tạo session mới
  │
  ├→ GET subscription → check tier
  │
  ├→ Free tier?
  │     └→ Count sessions this week
  │        └→ >= 2? → Reject (show upsell page)
  │        └→ < 2? → Allow
  │
  ├→ Paid tier?
  │     └→ Check endDate
  │        └→ Expired? → Downgrade to free
  │        └→ Active? → Allow (unlimited)
  │
  └→ B2B org tier?
        └→ Check org max_candidates_per_month
```

### Files cần tạo/sửa

**core-backend**:
- File mới: `Subscription.java` — Entity
- File mới: `SubscriptionRepository.java`
- File mới: `SubscriptionController.java` — GET current, POST subscribe
- File mới: `SubscriptionService.java` — Check tier, count sessions, enforce limits
- Sửa `SessionService.java` — Check subscription trước khi tạo session
- Migration: `V9__create_subscriptions_table.sql`

**web-app**:
- File mới: `src/app/pricing/page.tsx` — Pricing page B2C
- File mới: `src/components/dashboard/TierBadge.tsx` — Hiển thị gói hiện tại
- File mới: `src/components/dashboard/UpsellModal.tsx` — Show khi hết lượt free
- Sửa Dashboard — Hiển thị "Gói: Miễn phí | Còn X buổi tuần này"

---

## 5.2 — Payment Integration

### Nghiệp vụ

**Sinh viên (B2C)**:
- Thanh toán qua MoMo / ZaloPay / Bank QR (phổ biến nhất với SV)
- User chọn gói → chọn phương thức → scan QR / redirect app → xác nhận
- Auto-activate subscription ngay khi payment confirmed (webhook)
- Hiển thị lịch sử thanh toán trong profile

**Doanh nghiệp (B2B — future)**:
- Invoice/contract cho doanh nghiệp (không dùng QR)
- HR request pricing → sales contact → hợp đồng → activate thủ công
- Có thể tích hợp bank transfer + invoice automation sau

### Luồng thanh toán B2C

```
User chọn gói 49k/3 ngày
  │
  ├→ POST /api/v1/payments → create order
  │
  ├→ Generate MoMo/ZaloPay payment URL
  │     └→ Redirect user hoặc hiển thị QR
  │
  ├→ User thanh toán trên app MoMo/ZaloPay
  │
  ├→ MoMo/ZaloPay gọi webhook callback
  │     POST /api/v1/payments/webhook/momo
  │     {orderId, resultCode, ...}
  │
  ├→ Verify signature + resultCode
  │
  ├→ Create/extend subscription
  │
  └→ Notify user qua WebSocket: "Nâng cấp thành công!"
```

### Database

```sql
-- V15__create_payments_table.sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    subscription_id UUID REFERENCES subscriptions(id),
    amount INTEGER NOT NULL,                 -- VND, integer (49000)
    currency VARCHAR(10) DEFAULT 'VND',
    payment_method VARCHAR(50) NOT NULL,     -- momo, zalopay, bank_qr
    external_order_id VARCHAR(255),          -- MoMo/ZaloPay order ID
    status VARCHAR(50) DEFAULT 'pending',    -- pending, completed, failed, refunded
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_external ON payments(external_order_id);
```

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | /api/v1/payments | Bearer token | {tier, paymentMethod} | {paymentUrl, orderId} |
| GET | /api/v1/payments/me | Bearer token | — | Payment[] |
| POST | /api/v1/payments/webhook/momo | MoMo signature | MoMo callback body | 200 OK |
| POST | /api/v1/payments/webhook/zalopay | ZaloPay signature | ZaloPay callback body | 200 OK |

### Files cần tạo/sửa

**core-backend**:
- File mới: `Payment.java` — Entity
- File mới: `PaymentRepository.java`
- File mới: `PaymentController.java` — Create payment, webhook endpoints
- File mới: `MoMoService.java` — MoMo API integration
- File mới: `ZaloPayService.java` — ZaloPay API integration
- File mới: `SubscriptionService.java` — Activate subscription on payment success
- Migration: `V15__create_payments_table.sql`

**web-app**:
- File mới: `src/app/payment/page.tsx` — Payment flow (chọn method → QR/redirect)
- File mới: `src/app/payment/success/page.tsx` — Payment success confirmation

---

## 5.3 — Shareable Scorecard

### Nghiệp vụ

**Sinh viên (B2C)**:
- Share kết quả trên Facebook groups việc làm (65% SV dùng)
- Scorecard chỉ show TỔNG QUAN (không chi tiết) — privacy + tạo tò mò
- Tạo viral loop: bạn bè thấy scorecard → "cái gì đây?" → click link → đăng ký
- Khảo sát: "artifact shareable" tăng referral

**Doanh nghiệp (B2B — future)**:
- HR export PDF report đầy đủ cho ứng viên để gửi hiring manager
- PDF kèm: scores + tiêu chí + transcript highlights + disclaimer
- Khác SV: HR cần full report, không phải scorecard

### Màn hình — Scorecard (B2C)

```
┌──────────────────────────────────────┐
│  InterviewPro                        │
│  Frontend Developer — 78/100         │
│  ⭐⭐⭐⭐ Giao tiếp tốt            │
│  🎯 Top 3 điểm mạnh:               │
│  - Logic trả lời rõ ràng            │
│  - Giao tiếp mắt tốt                │
│  - Kiến thức vững                    │
│  interviewpro.vn                     │
└──────────────────────────────────────┘
```

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | /api/v1/reports/{id}/scorecard | Bearer token | — | {scorecardUrl, shareLink} |
| GET | /api/v1/scorecards/{code} | No auth | — | Scorecard data (public) |
| GET | /api/v1/reports/{id}/export/pdf | Bearer token (HR) | — | PDF file download |

### Files cần tạo/sửa

**web-app**:
- File mới: `src/components/report/ShareableCard.tsx` — Generate PNG scorecard
- File mới: `src/app/scorecard/[code]/page.tsx` — Public scorecard view
- Sửa Report page — Thêm nút "📤 Chia sẻ" → generate card + copy link

**core-backend**:
- File mới: `ScorecardController.java` — Generate + serve scorecards
- File mới: `PdfExportService.java` — Generate PDF reports cho HR

---

## 5.4 — Referral System

### Nghiệp vụ

**Sinh viên (B2C)**:
- Mỗi user có referral code duy nhất
- Mời bạn đăng ký dùng code → CẢ 2 được +1 session miễn phí (tuần đó)
- Track referrals, hiển thị stats trong profile
- Viral loop: share scorecard → bạn đăng ký → cả 2 được bonus

**Doanh nghiệp (B2B — future)**:
- HR mời HR khác → công ty được thêm UV slots
- Referral B2B qua email/link, track bằng org

### Database

```sql
-- V16__create_referrals_table.sql
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_id UUID NOT NULL REFERENCES users(id),
    referral_code VARCHAR(20) NOT NULL,
    bonus_applied BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(referred_id)  -- 1 user chỉ được referred 1 lần
);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);

-- Thêm referral_code vào users
ALTER TABLE users ADD COLUMN referral_code VARCHAR(20) UNIQUE;
```

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | /api/v1/users/me/referral | Bearer token | — | {referralCode, referralCount, bonusSessionsEarned} |
| POST | /api/v1/referrals/apply | Bearer token | {referralCode} | {success, bonusMessage} |

### Files cần tạo/sửa

**core-backend**:
- File mới: `Referral.java` — Entity
- File mới: `ReferralRepository.java`
- File mới: `ReferralController.java`
- File mới: `ReferralService.java` — Apply referral, grant bonus sessions
- Migration: `V16__create_referrals_table.sql`

**web-app**:
- File mới: `src/components/dashboard/ReferralCard.tsx` — Show referral code + stats
- Sửa profile page — Thêm referral section

---

## 5.5 — Landing Page

### Nghiệp vụ

**Sinh viên (B2C)**:
- Landing page giải quyết: "Cái này khác ChatGPT ở đâu?" (câu hỏi #1 từ mọi persona)
- Bảng so sánh trực quan: ChatGPT vs Tự luyện vs InterviewPro
- Sample report THẬT (không mock) — chứng minh feedback cụ thể
- Social proof: "93.5% SV sẵn sàng sử dụng"
- CTA: "Thử miễn phí — Không cần thẻ"
- SEO: "luyện phỏng vấn AI", "phỏng vấn thử online"

**Doanh nghiệp (B2B — future)**:
- Landing page B2B RIÊNG BIỆT — khác tone hoàn toàn so với SV
- Focus: tiết kiệm thời gian, ROI, sàng lọc thông minh
- Hero: "Tiết kiệm 70% thời gian phỏng vấn vòng 1"
- Trust: "AI hỗ trợ, không thay thế HR"
- Pricing B2B: Pilot miễn phí → Standard → Enterprise
- CTA: "Dùng thử miễn phí" + "Liên hệ tư vấn"
- Xem chi tiết UX tại `12-UX-BUSINESS-B2B.md` Màn 1

### Sections — Landing B2C (xem chi tiết `08-UX-STUDENT-B2C.md` Màn 1)

1. **Hero**: "Luyện phỏng vấn với AI — Giống HR thật" + CTA + demo video
2. **Comparison Table**: ChatGPT vs Tự luyện vs InterviewPro
3. **Features**: 4 key features (vặn hỏi, chấm điểm, sửa câu TL, body language)
4. **Sample Report**: Screenshot report thật — chứng minh không chung chung
5. **Social Proof**: "93.5% sẵn sàng sử dụng" + quotes
6. **Pricing**: 3 tiers B2C
7. **Privacy Badge**: "Video không lưu. Dữ liệu mã hóa."
8. **CTA cuối**: "Bắt đầu buổi đầu tiên — Miễn phí"
9. **FAQ**: AI đánh giá tiêu chí gì? Khác ChatGPT? Dữ liệu có bị lưu?

### Sections — Landing B2B (xem chi tiết `12-UX-BUSINESS-B2B.md` Màn 1)

1. **Hero**: "Sàng lọc ứng viên thông minh hơn — Tiết kiệm 70% thời gian"
2. **3 Lợi ích**: Sàng lọc tự động + Report minh bạch + Ứng viên chuẩn bị tốt hơn
3. **Trust**: "AI hỗ trợ, không thay thế HR"
4. **Pricing B2B**: Pilot / Standard / Enterprise
5. **FAQ cho HR**: AI chính xác cỡ nào? Gian lận? Bảo mật? Tích hợp?
6. **CTA**: "Bắt đầu pilot miễn phí"

### Files cần tạo/sửa

**web-app**:
- Sửa `src/app/page.tsx` → Landing page B2C đầy đủ (9 sections)
- File mới: `src/app/business/page.tsx` → Landing page B2B
- File mới: `src/components/landing/ComparisonTable.tsx`
- File mới: `src/components/landing/FeatureSection.tsx`
- File mới: `src/components/landing/SampleReport.tsx`
- File mới: `src/components/landing/PricingTable.tsx` — B2C pricing
- File mới: `src/components/landing/PricingTableB2B.tsx` — B2B pricing
- File mới: `src/components/landing/FAQSection.tsx`

---

## 5.6 — B2B Pricing & Subscription (B2B — future)

### Nghiệp vụ

**Doanh nghiệp (B2B)**:
- Pricing tách biệt hoàn toàn khỏi B2C — doanh nghiệp có budget khác, process khác
- Pilot miễn phí 30 ngày → chứng minh giá trị → đề xuất mua
- Standard/Enterprise: liên hệ báo giá → hợp đồng → activate
- Insight HR Linh: ban đầu hoài nghi → thấy report tốt → đề xuất công ty mua gói
- Cảm xúc HR qua journey (từ `12-UX-BUSINESS-B2B.md`):
  - Landing: 🤔 "Hay đấy, nhưng AI chính xác không?"
  - Pilot: 😊 "Miễn phí, thử xem sao"
  - 1 tháng: 🤝 "Đề xuất công ty mua gói"

### Bảng tiers B2B

| Tier | Giá | Giới hạn | Features |
|------|-----|----------|----------|
| Pilot | 0đ / 30 ngày | 5 ứng viên, 1 vị trí | Report cơ bản, 1 HR account |
| Standard | Liên hệ | 20+ ứng viên/tháng, nhiều vị trí | Full report + so sánh + export, nhiều HR |
| Enterprise | Custom | Unlimited | API access, ATS integration, SLA, custom branding |

### Luồng B2B onboarding

```
HR vào landing B2B
  │
  ├→ Click "Bắt đầu pilot"
  │     └→ Đăng ký tài khoản HR (name, email, company name)
  │        └→ Auto-create organization (pilot tier, 30 days)
  │        └→ Redirect → HR Dashboard
  │
  ├→ Hoặc click "Liên hệ"
  │     └→ Form: name, email, company, số UV/tháng, message
  │        └→ Sales team nhận lead → contact → hợp đồng
  │
  └→ Pilot hết hạn
        └→ Show upgrade prompt
        └→ "Liên hệ để nâng cấp" → sales flow
```

### Database

Sử dụng bảng `organizations` (task 4.6) và `subscriptions` (task 5.1):
```sql
-- organizations.subscription_tier: 'pilot' | 'standard' | 'enterprise'
-- organizations.pilot_start_date, pilot_end_date: cho pilot tracking
-- organizations.max_candidates_per_month: theo tier

-- Thêm B2B leads table
-- V17__create_b2b_leads_table.sql
CREATE TABLE b2b_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    estimated_candidates_per_month INTEGER,
    message TEXT,
    status VARCHAR(50) DEFAULT 'new',     -- new, contacted, converted, lost
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### API

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | /api/v1/organizations/register | No auth | {name, email, companyName, password} | Organization + token (pilot) |
| POST | /api/v1/b2b-leads | No auth | {contactName, email, companyName, estimatedCandidates, message} | {success} |
| GET | /api/v1/organizations/me/subscription | Bearer token (HR) | — | Org subscription details |

### Files cần tạo/sửa

**core-backend**:
- File mới: `B2BLead.java` — Entity
- File mới: `B2BLeadRepository.java`
- File mới: `B2BLeadController.java` — POST lead from landing page
- Sửa `OrganizationService.java` — Register org with pilot tier
- Migration: `V17__create_b2b_leads_table.sql`

**web-app**:
- Sửa `src/app/business/page.tsx` — "Bắt đầu pilot" → registration flow
- File mới: `src/app/business/register/page.tsx` — HR registration
- File mới: `src/app/business/contact/page.tsx` — Contact form for Standard/Enterprise

---

## Thứ tự thực hiện Phase 5

```
B2C (ưu tiên):
5.1 Pricing tiers         (core-backend + web-app) — cần subscription logic
    |
    +-> 5.2 Payment        (core-backend + web-app) — cần subscription
    |
    +-> 5.3 Scorecard      (web-app + core-backend) — song song
    |
    +-> 5.4 Referral       (core-backend + web-app) — song song

5.5 Landing page           (web-app) — song song, có thể làm sớm

B2B (future):
5.6 B2B Pricing            (core-backend + web-app) — cần organizations từ 4.6
```
