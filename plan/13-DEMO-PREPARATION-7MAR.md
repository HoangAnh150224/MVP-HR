# Demo Preparation — Deadline: Chủ Nhật 7/3/2026

> **Gửi cho thầy Thắng qua Zalo trước Chủ Nhật 7/3/2026 để nhận feedback.**
>
> Feedback thầy:
> - AI phải demo **như đang trò chuyện nâng cao**, KHÔNG phải phỏng vấn cứng nhắc
> - Input kịch bản mẫu: 10 câu hỏi đưa sẵn cho AI
> - AI chấm điểm từng phần: tự tin, giao tiếp (2 câu), giải quyết vấn đề, chuyên môn (2 câu)
> - Cho cái yếu cái mạnh linh hoạt
> - AI trả lời NGẮN (như người phỏng vấn thật)
> - Hỏi đa dạng chủ đề: sở thích, thói quen, tình huống, thái độ
> - AI tự điều chỉnh theo cách trả lời của ứng viên
> - Biểu cảm khuôn mặt: đã demo sơ nhưng chưa nhúng được — cần tích hợp

---

## 1. Kịch bản demo (Demo Script)

### Bối cảnh demo
- **Vị trí**: Frontend Developer — Junior
- **Ứng viên giả định**: Sinh viên năm cuối ĐH FPT, 21 tuổi, có 1 dự án React
- **Thời gian phỏng vấn**: ~15-20 phút
- **AI persona**: "Minh" — anh/chị HR thân thiện, nói chuyện tự nhiên

### Luồng demo cho thầy

```
1. Mở app → Landing page (giới thiệu sản phẩm)
2. Đăng nhập → Dashboard
3. Tạo phỏng vấn mới → Chọn "Frontend Developer" + "Junior"
4. (Tuỳ chọn) Upload CV mẫu → AI parse xong
5. Consent screen → Đồng ý
6. Vào phòng phỏng vấn → AI chào + bắt đầu trò chuyện
7. Demo 5-6 câu hỏi (rút gọn từ 10 câu)
8. Kết thúc → AI tạo report
9. Xem report: điểm từng phần + mạnh/yếu + mẹo cải thiện
10. (Bonus) Xem transcript + speech metrics
```

---

## 2. Bộ 10 câu hỏi phỏng vấn mẫu

> AI PHẢI hỏi **như đang trò chuyện**, KHÔNG phải đọc danh sách.
> Câu hỏi tiếp theo DỰA TRÊN câu trả lời trước đó.
> AI trả lời/phản hồi NGẮN (1-2 câu) trước khi hỏi câu tiếp.

### Phân loại câu hỏi theo tiêu chí chấm điểm

| # | Câu hỏi | Chủ đề | Tiêu chí đánh giá | Mục đích |
|---|---------|--------|-------------------|----------|
| 1 | "Chào bạn! Bạn giới thiệu qua về bản thân — tuổi, đang làm gì, kinh nghiệm sao nhé?" | Giới thiệu / Kinh nghiệm | Giao tiếp, Tự tin | Warm-up, đánh giá khả năng trình bày |
| 2 | "Vậy tại sao bạn lại muốn tìm việc ở vị trí Frontend Developer? Điều gì thu hút bạn?" | Động lực / Tại sao tìm job | Tự tin, Thái độ | Đánh giá motivation + passion |
| 3 | "Hay đấy! Ngoài code, bạn có sở thích gì không? Giải trí kiểu gì?" | Sở thích | Giao tiếp (câu 1) | Tạo không khí thoải mái, đánh giá tính cách |
| 4 | "Thói quen hàng ngày của bạn ra sao? Kiểu sáng dậy code luôn hay có routine gì?" | Thói quen | Giao tiếp (câu 2) | Đánh giá kỷ luật, soft skills |
| 5 | "OK, nói về chuyên môn nhé — bạn tự đánh giá mình mạnh nhất ở đâu trong Frontend?" | Chuyên môn tự đánh giá | Chuyên môn (câu 1) | Đánh giá nhận thức bản thân + kiến thức |
| 6 | "Bạn có thể kể về 1 dự án hoặc tính năng mà bạn tự hào nhất không?" | Chuyên môn / Dự án | Chuyên môn (câu 2) | Đánh giá depth of knowledge + STAR |
| 7 | "Giả sử khách hàng phản hồi trang web load chậm, bạn sẽ xử lý thế nào?" | Tình huống / Problem-solving | Giải quyết vấn đề | Đánh giá tư duy logic + kinh nghiệm thực tế |
| 8 | "Nếu trong team có người code style khác hẳn bạn, bạn xử lý sao?" | Tình huống / Thái độ | Giải quyết vấn đề, Thái độ | Đánh giá teamwork + conflict resolution |
| 9 | "Bạn thấy mình cần cải thiện gì nhất để trở thành developer giỏi hơn?" | Tự nhận thức | Tự tin, Thái độ | Đánh giá self-awareness + growth mindset |
| 10 | "Cuối cùng, bạn có câu hỏi gì muốn hỏi ngược lại không?" | Kết thúc | Tự tin, Giao tiếp | Đánh giá sự chủ động |

### Cách AI chuyển câu hỏi (conversational flow)

```
❌ SAI (rigid interview):
AI: "Câu 1: Giới thiệu bản thân"
AI: "Câu 2: Tại sao tìm việc?"
AI: "Câu 3: Sở thích?"

✓ ĐÚNG (trò chuyện tự nhiên):
AI: "Chào bạn! Mình là Minh, hôm nay mình muốn trò chuyện
     để hiểu hơn về bạn nhé. Bạn kể qua về mình đi —
     đang làm gì, có kinh nghiệm gì rồi?"
User: "Dạ em đang là SV năm cuối FPT, em có làm 1 dự án React..."
AI: "À hay đấy, React project thú vị nhỉ! Mà ngoài code,
     bạn giải trí kiểu gì? Có sở thích gì vui không?"
     ← NGẮN, TỰ NHIÊN, DẪN DẮT
```

### Quy tắc cho AI trong demo

1. **Trả lời NGẮN** (1-2 câu) trước khi hỏi tiếp — như người phỏng vấn thật
2. **Phản hồi câu trước** ("À hay đấy!", "Thú vị nhỉ!", "Hmm, vậy à?") rồi mới hỏi
3. **Không đọc câu hỏi máy móc** — diễn đạt tự nhiên, có thể thay đổi từ ngữ
4. **Hỏi follow-up** dựa trên câu trả lời: user nói "em thích React" → "React thì bạn thích hooks hay class component?"
5. **Đa dạng chủ đề** — không chỉ kỹ thuật, xen kẽ sở thích/thói quen/tình huống
6. **Tone thân thiện** — "bạn", "mình", không "anh/chị" quá formal
7. **AI tự điều chỉnh**: user trả lời ngắn → AI hỏi gợi mở thêm; user nói dài → AI summary rồi hỏi tiếp

---

## 3. Rubric chấm điểm từng phần

> Thầy yêu cầu: chấm điểm từng phần, cho biết cái mạnh cái yếu, linh hoạt.

### 5 tiêu chí đánh giá

| Tiêu chí | Trọng số | Câu hỏi đánh giá | Mô tả |
|----------|----------|-------------------|--------|
| **Sự tự tin** | 20% | Xuyên suốt (đặc biệt Q1, Q2, Q9, Q10) | Giọng nói rõ ràng, ít ngập ngừng, dám nêu quan điểm |
| **Kĩ năng giao tiếp** | 25% | Q3 (sở thích), Q4 (thói quen) + overall | Diễn đạt mạch lạc, trả lời đúng trọng tâm, tương tác tốt |
| **Giải quyết vấn đề** | 20% | Q7 (tình huống kỹ thuật), Q8 (conflict) | Tư duy logic, phân tích vấn đề, đưa giải pháp cụ thể |
| **Chuyên môn** | 25% | Q5 (tự đánh giá), Q6 (dự án) | Kiến thức kỹ thuật, chiều sâu, ví dụ thực tế |
| **Thái độ & Growth** | 10% | Q2 (motivation), Q8 (teamwork), Q9 (cải thiện) | Thái độ tích cực, ham học, nhận thức bản thân |

### Output chấm điểm — ví dụ

```json
{
  "overallScore": 72,
  "sections": [
    {
      "name": "Sự tự tin",
      "score": 7,
      "maxScore": 10,
      "weight": "20%",
      "feedback": "Trả lời khá tự tin ở phần giới thiệu, nhưng ngập ngừng khi nói về điểm yếu.",
      "strength": "Dám chia sẻ quan điểm cá nhân, giọng nói rõ ràng",
      "weakness": "Dùng 5 từ đệm (ờ, à) khi nói về điểm cần cải thiện",
      "tip": "Khi không chắc, hãy dừng 1 giây thay vì nói 'ờ'. Sự im lặng ngắn thể hiện sự tự tin."
    },
    {
      "name": "Kĩ năng giao tiếp",
      "score": 8,
      "maxScore": 10,
      "weight": "25%",
      "feedback": "Giao tiếp tốt, trả lời đúng trọng tâm, kể chuyện hấp dẫn khi nói về sở thích.",
      "strength": "Biết kể chuyện, dẫn dắt logic, thân thiện",
      "weakness": "Đôi khi trả lời hơi dài, có thể ngắn gọn hơn",
      "tip": "Áp dụng quy tắc 30-60 giây: mỗi câu trả lời nên trong khoảng 30-60 giây."
    },
    {
      "name": "Giải quyết vấn đề",
      "score": 6,
      "maxScore": 10,
      "weight": "20%",
      "feedback": "Có hướng giải quyết nhưng thiếu cấu trúc, chưa nêu được kết quả cụ thể.",
      "strength": "Biết phân tích nguyên nhân vấn đề",
      "weakness": "Thiếu bước đánh giá kết quả (Result trong STAR)",
      "tip": "Khi kể về cách giải quyết vấn đề, luôn kết bằng kết quả cụ thể: 'Nhờ đó, page load từ 5s xuống 1.2s'"
    },
    {
      "name": "Chuyên môn",
      "score": 7,
      "maxScore": 10,
      "weight": "25%",
      "feedback": "Kiến thức React khá tốt, có dự án thực tế. Chưa sâu về performance optimization.",
      "strength": "Hiểu React hooks, có kinh nghiệm dự án thực",
      "weakness": "Chưa nắm sâu về performance (lazy loading, code splitting)",
      "tip": "Tìm hiểu thêm về React.memo, useMemo, và lazy loading để trả lời sâu hơn về tối ưu."
    },
    {
      "name": "Thái độ & Growth mindset",
      "score": 8,
      "maxScore": 10,
      "weight": "10%",
      "feedback": "Thái độ tích cực, biết nhìn nhận điểm yếu, có kế hoạch cải thiện.",
      "strength": "Thẳng thắn nhận điểm yếu, có motivation rõ ràng",
      "weakness": "Kế hoạch cải thiện còn chung chung, chưa cụ thể timeline",
      "tip": "Khi nói về kế hoạch, hãy cụ thể: 'Trong 3 tháng tới em sẽ hoàn thành course X, làm project Y'"
    }
  ],
  "summary": {
    "strengths": [
      "Giao tiếp tự nhiên, thân thiện",
      "Có kinh nghiệm dự án React thực tế",
      "Thái độ tích cực, ham học hỏi"
    ],
    "weaknesses": [
      "Cần giảm từ đệm (ờ, à) khi trả lời",
      "Thiếu Result trong STAR — cần nêu kết quả cụ thể",
      "Kiến thức performance optimization còn mỏng"
    ],
    "top3Actions": [
      "Luyện dừng 1 giây thay vì nói từ đệm — ghi âm và nghe lại",
      "Mỗi câu trả lời STAR đều kết bằng con số: 'tăng X%, giảm Y%, phục vụ Z users'",
      "Đọc thêm về React performance: React.memo, useMemo, code splitting"
    ]
  }
}
```

### Hiển thị trên Report (demo cho thầy)

```
┌──────────────────────────────────────────────────────────────┐
│  📊 Kết quả phỏng vấn — Frontend Developer (Junior)          │
│  Tổng điểm: 72/100                                           │
│  [███████████████████████████████░░░░░░░░░]                   │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ── ĐIỂM TỪNG PHẦN ──                                        │
│                                                                │
│  Sự tự tin        ███████░░░ 7/10   (20%)                     │
│    ✓ Mạnh: Dám chia sẻ quan điểm                              │
│    ✗ Yếu: Ngập ngừng khi nói điểm yếu                        │
│    💡 Dừng 1 giây thay vì nói "ờ"                             │
│                                                                │
│  Kĩ năng giao tiếp ████████░░ 8/10   (25%)                   │
│    ✓ Mạnh: Kể chuyện hấp dẫn, dẫn dắt logic                 │
│    ✗ Yếu: Đôi khi trả lời hơi dài                            │
│    💡 Quy tắc 30-60 giây cho mỗi câu trả lời                 │
│                                                                │
│  Giải quyết vấn đề ██████░░░░ 6/10   (20%)                   │
│    ✓ Mạnh: Biết phân tích nguyên nhân                         │
│    ✗ Yếu: Thiếu kết quả cụ thể (STAR Result)                 │
│    💡 Luôn kết bằng số: "tăng X%, giảm Y%"                   │
│                                                                │
│  Chuyên môn         ███████░░░ 7/10   (25%)                   │
│    ✓ Mạnh: React hooks + dự án thực                           │
│    ✗ Yếu: Chưa sâu về performance optimization               │
│    💡 Tìm hiểu React.memo, useMemo, lazy loading             │
│                                                                │
│  Thái độ & Growth   ████████░░ 8/10   (10%)                   │
│    ✓ Mạnh: Tích cực, nhận điểm yếu thẳng thắn               │
│    ✗ Yếu: Kế hoạch cải thiện chung chung                     │
│    💡 Cụ thể: "3 tháng tới em sẽ..."                         │
│                                                                │
│  ── TOP 3 ƯU TIÊN SỬA ──                                     │
│  1. Luyện dừng 1 giây thay từ đệm — ghi âm nghe lại         │
│  2. STAR luôn kết bằng con số: "tăng X%, phục vụ Y users"    │
│  3. Đọc thêm React performance optimization                   │
│                                                                │
│  [← Dashboard]  [🔄 Luyện lại]  [📤 Chia sẻ]                │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Yêu cầu kỹ thuật cho demo

### 4.1 — System Prompt cho AI (voice-agent-service)

Sửa system prompt để AI hành xử đúng theo feedback thầy:

```
Bạn là Minh, một người phỏng vấn thân thiện. Bạn đang TRÒ CHUYỆN
với ứng viên, KHÔNG phải phỏng vấn cứng nhắc.

QUY TẮC:
1. Trả lời NGẮN (1-2 câu): phản hồi câu trước + hỏi câu tiếp
2. Nói tự nhiên: "À hay đấy!", "Hmm thú vị nhỉ!", "OK mình hiểu rồi"
3. Hỏi follow-up DỰA TRÊN câu trả lời — KHÔNG đọc danh sách
4. Xen kẽ chủ đề: kỹ thuật → sở thích → tình huống → thói quen
5. Nếu ứng viên trả lời ngắn → gợi mở thêm: "Bạn kể chi tiết hơn được không?"
6. Nếu ứng viên nói dài → tóm tắt: "OK vậy ý chính là..." rồi hỏi tiếp
7. KHÔNG nói "Câu hỏi tiếp theo là...", KHÔNG đánh số câu hỏi
8. Hỏi khoảng 8-10 câu, mỗi câu đợi ứng viên trả lời xong mới hỏi tiếp
9. Đánh giá qua giọng nói: tự tin, rõ ràng, ít ngập ngừng
10. Khi kết thúc: "OK cảm ơn bạn nhiều, mình thấy buổi trò chuyện rất thú vị!"

CHỦ ĐỀ CẦN COVER (không nhất thiết theo thứ tự):
- Giới thiệu bản thân + kinh nghiệm
- Tại sao muốn làm vị trí này
- Sở thích cá nhân
- Thói quen hàng ngày / học tập
- Kiến thức chuyên môn (2 câu sâu)
- Tình huống kỹ thuật / problem-solving
- Tình huống teamwork / conflict
- Tự đánh giá điểm mạnh/yếu
- Kế hoạch phát triển

TIÊU CHÍ CHẤM ĐIỂM (ghi nhận trong quá trình hỏi):
- Sự tự tin: giọng nói, ngập ngừng, từ đệm
- Giao tiếp: mạch lạc, đúng trọng tâm, biết kể chuyện
- Giải quyết vấn đề: logic, cụ thể, có kết quả
- Chuyên môn: chiều sâu kiến thức, ví dụ thực tế
- Thái độ: tích cực, ham học, tự nhận thức
```

### 4.2 — AI tự điều chỉnh theo ứng viên (Adaptive AI)

**Cơ chế**: AI quan sát pattern trả lời của ứng viên và điều chỉnh:

| Pattern ứng viên | AI điều chỉnh |
|-------------------|----------------|
| Trả lời ngắn (< 15 giây) | Hỏi gợi mở: "Bạn kể thêm chút đi" |
| Trả lời dài (> 90 giây) | Summary + next: "OK hay lắm! Vậy mình qua chủ đề khác nhé" |
| Nhiều từ đệm | AI nói chậm hơn, tạo không khí thoải mái |
| Câu trả lời chung chung | Hỏi cụ thể: "Cho mình 1 ví dụ cụ thể được không?" |
| Ứng viên lo lắng | Khuyến khích: "Không sao, từ từ nhé, không vội đâu" |
| Trả lời sai chủ đề | Nhẹ nhàng đưa về: "À vậy hả, nhưng mà về câu hỏi..." |

**Implementation**: Thêm vào system prompt + Gemini context window đã có khả năng này.

### 4.3 — Nhúng biểu cảm khuôn mặt (Vision Integration)

**Hiện trạng**: vision-analytics-service ĐÃ detect eye contact + head pose qua MediaPipe, nhưng:
- Chỉ gửi warning real-time, chưa aggregate vào report
- Chưa detect biểu cảm (smile/neutral/nervous)

**Cần làm cho demo**:

| Feature | Status | Priority cho demo |
|---------|--------|-------------------|
| Eye contact detection | ✓ DONE | Hiển thị % trong report |
| Head pose stability | ✓ DONE | Hiển thị trong report |
| Warning toast | ✓ DONE (có UI) | Bật trong demo |
| Aggregate metrics | ✗ NOT DONE | **P0 — cần cho report** |
| Biểu cảm (smile/nervous) | ✗ NOT DONE | P1 — nice to have |

**Minimum cho demo**:
1. Vision warnings hiện real-time trong phòng phỏng vấn ✓
2. Aggregate eye contact % + head stability vào report (task 2.4)
3. Hiển thị section "Phong thái" trong report

### 4.4 — Bộ câu trả lời mẫu cho demo (Sample Answers)

Khi demo cho thầy, AI cần generate **câu trả lời mẫu tốt hơn** cho mỗi câu. Ví dụ:

**Câu 6 — "Kể về dự án tâm đắc"**:
- Ứng viên nói: "Em làm dự án web bán hàng bằng React, em làm giao diện, cũng khá vui"
- AI sample answer: "Trong dự án e-commerce tại FPT, em phụ trách toàn bộ frontend với React + TypeScript. Thách thức lớn nhất là tối ưu load time cho 200+ sản phẩm — em áp dụng lazy loading + infinite scroll, giảm initial load từ 4s xuống 1.5s. Dự án phục vụ 500 users/ngày trong 2 tháng pilot."

---

## 5. Checklist demo trước 7/3/2026

### Must-have (không có = không demo được)

- [ ] AI trò chuyện tự nhiên (KHÔNG phỏng vấn cứng) — sửa system prompt
- [ ] 10 câu hỏi đa dạng chủ đề (kỹ thuật + sở thích + tình huống + thái độ)
- [ ] AI trả lời ngắn (1-2 câu), phản hồi trước khi hỏi tiếp
- [ ] Chấm điểm 5 tiêu chí: tự tin, giao tiếp, giải quyết vấn đề, chuyên môn, thái độ
- [ ] Report hiển thị: điểm từng phần + mạnh/yếu + mẹo cải thiện
- [ ] E2E flow: tạo session → phỏng vấn → nhận report

### Should-have (tăng chất lượng demo)

- [ ] AI hỏi follow-up dựa trên câu trả lời
- [ ] Vision: eye contact warning hiện real-time
- [ ] Vision: aggregate metrics trong report (eye contact %)
- [ ] Speech metrics: WPM + từ đệm count trong report
- [ ] Câu trả lời mẫu (sample answer) cho mỗi câu
- [ ] Transcript hiển thị real-time

### Nice-to-have (bonus nếu kịp)

- [ ] AI adaptive: điều chỉnh theo cách trả lời ứng viên
- [ ] Biểu cảm khuôn mặt (smile/nervous) detection
- [ ] Progress chart (nếu chạy 2+ sessions)
- [ ] Landing page hoàn chỉnh

---

## 6. Mapping với các Phase hiện tại

| Demo requirement | Phase/Task | Status |
|-----------------|------------|--------|
| E2E flow (session → interview → report) | Phase 1 (all) | ~90% done |
| System prompt conversational | Phase 3 (3.0 + voice-agent) | Cần sửa |
| 10 câu hỏi đa dạng | voice-agent system prompt | Cần sửa |
| AI trả lời ngắn | voice-agent system prompt | Cần sửa |
| Chấm điểm 5 tiêu chí | Phase 2 (2.2, 2.3) + llm-orchestrator | Cần sửa scoring prompt |
| Report mạnh/yếu/mẹo | Phase 2 (2.5) + Phase 1 (1.5) | Cần nâng cấp report |
| Vision aggregate | Phase 2 (2.4) | NOT DONE |
| Speech metrics in report | Phase 2 (2.1) | NOT DONE |
| Transcript panel | Phase 2 (2.6) | NOT DONE |
| AI adaptive | Phase 3 (MỚI) | NOT DONE |
| Biểu cảm | Phase 2 (2.4 mở rộng) | NOT DONE |

### Ưu tiên implementation cho deadline 7/3

```
Ngày 2/3 (Thứ 2):
  → Sửa system prompt: conversational + 10 câu hỏi + trả lời ngắn
  → Sửa scoring prompt: 5 tiêu chí + mạnh/yếu/mẹo

Ngày 3/3 (Thứ 3):
  → Nâng cấp report page: hiển thị 5 tiêu chí + mạnh/yếu
  → Fix các bug E2E flow còn lại

Ngày 4/3 (Thứ 4):
  → Speech metrics: voice-agent gửi → core-backend lưu → report hiển thị
  → Vision aggregate: collect → report hiển thị

Ngày 5/3 (Thứ 5):
  → Transcript panel real-time
  → AI follow-up dựa trên câu trả lời

Ngày 6/3 (Thứ 6):
  → Test end-to-end toàn bộ flow
  → Fix bugs + polish UI
  → Quay video demo hoặc chuẩn bị live demo

Ngày 7/3 (Chủ Nhật):
  → Gửi cho thầy Thắng qua Zalo
```
