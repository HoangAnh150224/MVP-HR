-- ============================================================
-- V15: Seed default Knowledge Base data
-- ============================================================

-- ── 9 Industries ──
INSERT INTO kb_industries (name, slug, description) VALUES
('Công nghệ thông tin', 'it', 'Phần mềm, hạ tầng, dữ liệu, AI/ML'),
('Tài chính - Ngân hàng', 'finance', 'Ngân hàng, bảo hiểm, chứng khoán, fintech'),
('Marketing - Truyền thông', 'marketing', 'Digital marketing, PR, branding, content'),
('Nhân sự', 'hr', 'Tuyển dụng, đào tạo, C&B, HRBP'),
('Kinh doanh - Sales', 'sales', 'B2B, B2C, account management, business development'),
('Kế toán - Kiểm toán', 'accounting', 'Kế toán tổng hợp, kiểm toán, thuế'),
('Giáo dục', 'education', 'Giảng dạy, đào tạo, edtech'),
('Y tế - Sức khỏe', 'healthcare', 'Bác sĩ, dược, điều dưỡng, healthtech'),
('Khác', 'other', 'Các ngành nghề khác')
ON CONFLICT (slug) DO NOTHING;

-- ── 5 Scoring Rubrics (theo yêu cầu giáo viên) ──
INSERT INTO kb_scoring_rubrics (name, slug, description, weight_percent, score_levels) VALUES
('Sự tự tin', 'confidence', 'Đánh giá mức độ tự tin, bình tĩnh khi trả lời', 20,
 '{
   "excellent": {"min": 9, "max": 10, "label": "Xuất sắc", "description": "Rất tự tin, trả lời rõ ràng, không ngập ngừng"},
   "good": {"min": 7, "max": 8, "label": "Tốt", "description": "Khá tự tin, đôi khi hơi ngập ngừng nhưng vẫn kiểm soát tốt"},
   "average": {"min": 5, "max": 6, "label": "Trung bình", "description": "Có phần lo lắng, dùng nhiều từ đệm"},
   "below_average": {"min": 3, "max": 4, "label": "Dưới trung bình", "description": "Rõ ràng thiếu tự tin, ngập ngừng nhiều"},
   "poor": {"min": 0, "max": 2, "label": "Yếu", "description": "Rất lo lắng, không thể diễn đạt ý"}
 }'),
('Kỹ năng giao tiếp', 'communication', 'Đánh giá khả năng diễn đạt, trình bày ý tưởng', 25,
 '{
   "excellent": {"min": 9, "max": 10, "label": "Xuất sắc", "description": "Diễn đạt mạch lạc, logic, sử dụng ví dụ cụ thể"},
   "good": {"min": 7, "max": 8, "label": "Tốt", "description": "Trình bày rõ ràng, có cấu trúc"},
   "average": {"min": 5, "max": 6, "label": "Trung bình", "description": "Diễn đạt được nhưng đôi khi lan man"},
   "below_average": {"min": 3, "max": 4, "label": "Dưới trung bình", "description": "Khó theo dõi, thiếu cấu trúc"},
   "poor": {"min": 0, "max": 2, "label": "Yếu", "description": "Không thể trình bày ý tưởng rõ ràng"}
 }'),
('Giải quyết vấn đề', 'problem_solving', 'Đánh giá tư duy phân tích và khả năng giải quyết vấn đề', 20,
 '{
   "excellent": {"min": 9, "max": 10, "label": "Xuất sắc", "description": "Phân tích sắc bén, đưa ra giải pháp sáng tạo và khả thi"},
   "good": {"min": 7, "max": 8, "label": "Tốt", "description": "Phân tích tốt, giải pháp hợp lý"},
   "average": {"min": 5, "max": 6, "label": "Trung bình", "description": "Có khả năng phân tích cơ bản, giải pháp chung chung"},
   "below_average": {"min": 3, "max": 4, "label": "Dưới trung bình", "description": "Phân tích yếu, giải pháp không thực tế"},
   "poor": {"min": 0, "max": 2, "label": "Yếu", "description": "Không thể phân tích hoặc đưa ra giải pháp"}
 }'),
('Kiến thức chuyên môn', 'expertise', 'Đánh giá kiến thức và kỹ năng chuyên ngành', 25,
 '{
   "excellent": {"min": 9, "max": 10, "label": "Xuất sắc", "description": "Kiến thức sâu rộng, nắm vững cả lý thuyết và thực hành"},
   "good": {"min": 7, "max": 8, "label": "Tốt", "description": "Kiến thức tốt, có kinh nghiệm thực tế"},
   "average": {"min": 5, "max": 6, "label": "Trung bình", "description": "Kiến thức cơ bản, thiếu chiều sâu"},
   "below_average": {"min": 3, "max": 4, "label": "Dưới trung bình", "description": "Kiến thức hạn chế, nhiều lỗ hổng"},
   "poor": {"min": 0, "max": 2, "label": "Yếu", "description": "Hầu như không có kiến thức chuyên môn"}
 }'),
('Thái độ & Phong thái', 'attitude', 'Đánh giá thái độ chuyên nghiệp, sự nhiệt tình', 10,
 '{
   "excellent": {"min": 9, "max": 10, "label": "Xuất sắc", "description": "Rất chuyên nghiệp, nhiệt tình, thể hiện đam mê rõ ràng"},
   "good": {"min": 7, "max": 8, "label": "Tốt", "description": "Chuyên nghiệp, thái độ tích cực"},
   "average": {"min": 5, "max": 6, "label": "Trung bình", "description": "Thái độ bình thường, chưa thể hiện nhiều đam mê"},
   "below_average": {"min": 3, "max": 4, "label": "Dưới trung bình", "description": "Thái độ thờ ơ, ít quan tâm"},
   "poor": {"min": 0, "max": 2, "label": "Yếu", "description": "Thái độ tiêu cực, không chuyên nghiệp"}
 }')
ON CONFLICT (slug) DO NOTHING;

-- ── Conversation Templates ──
INSERT INTO kb_conversation_templates (type, name, template_text, sort_order) VALUES
-- Opening templates
('opening', 'Chào hỏi chuẩn', 'Xin chào, mình là Minh từ InterviewPro. Hôm nay mình sẽ trao đổi với bạn khoảng 15-20 phút nhé. Bạn sẵn sàng chưa?', 1),
('opening', 'Chào hỏi thân thiện', 'Chào bạn! Mình là Minh, hôm nay mình sẽ cùng bạn luyện phỏng vấn nhé. Đừng lo lắng, cứ thoải mái như đang trò chuyện bình thường. Bạn sẵn sàng chưa?', 2),

-- Transition templates (chuyển câu hỏi)
('transition', 'Chuyển tiếp khen', 'Cảm ơn bạn đã chia sẻ. Bây giờ mình chuyển sang một chủ đề khác nhé.', 1),
('transition', 'Chuyển tiếp tự nhiên', 'Hay lắm! Mình muốn hỏi thêm về một khía cạnh khác nha.', 2),
('transition', 'Chuyển tiếp nhẹ nhàng', 'Rất thú vị. Để mình hỏi bạn thêm một câu nữa nhé.', 3),

-- Encouragement templates (khuyến khích)
('encouragement', 'Khuyến khích suy nghĩ', 'Bạn cứ từ từ suy nghĩ nhé, không cần vội.', 1),
('encouragement', 'Khuyến khích chi tiết', 'Bạn có thể chia sẻ thêm chi tiết không? Ví dụ cụ thể sẽ giúp mình hiểu rõ hơn.', 2),
('encouragement', 'Khuyến khích STAR', 'Bạn thử kể theo cấu trúc: tình huống là gì, bạn làm gì, và kết quả ra sao nhé.', 3),

-- Closing templates
('closing', 'Kết thúc chuẩn', 'Cảm ơn bạn rất nhiều! Buổi phỏng vấn hôm nay rất tốt. Kết quả chi tiết sẽ được gửi cho bạn sớm nhất nhé.', 1),
('closing', 'Kết thúc động viên', 'Cảm ơn bạn đã dành thời gian! Bạn đã thể hiện rất tốt. Mình sẽ gửi feedback chi tiết cho bạn ngay sau đây.', 2),

-- Probing templates (đào sâu)
('probing', 'Hỏi kết quả cụ thể', 'Kết quả cụ thể là gì? Có số liệu nào bạn có thể chia sẻ không?', 1),
('probing', 'Hỏi khó khăn', 'Khó khăn lớn nhất bạn gặp phải là gì và bạn đã vượt qua như thế nào?', 2),
('probing', 'Hỏi bài học', 'Nếu được làm lại, bạn sẽ thay đổi điều gì?', 3);

-- ── 10 Role Templates (IT-focused) ──
INSERT INTO kb_role_templates (industry_id, name, slug, description, typical_skills, difficulty) VALUES
((SELECT id FROM kb_industries WHERE slug = 'it'), 'Backend Developer', 'backend-developer',
 'Lập trình viên backend - xây dựng API, database, server-side logic',
 '["Java", "Spring Boot", "REST API", "SQL", "Docker", "Git", "Microservices"]', 'mid'),

((SELECT id FROM kb_industries WHERE slug = 'it'), 'Frontend Developer', 'frontend-developer',
 'Lập trình viên frontend - xây dựng giao diện người dùng',
 '["React", "TypeScript", "HTML/CSS", "Next.js", "Tailwind", "Git"]', 'mid'),

((SELECT id FROM kb_industries WHERE slug = 'it'), 'Fullstack Developer', 'fullstack-developer',
 'Lập trình viên fullstack - cả frontend và backend',
 '["React", "Node.js", "TypeScript", "SQL", "Docker", "Git", "REST API"]', 'mid'),

((SELECT id FROM kb_industries WHERE slug = 'it'), 'Mobile Developer', 'mobile-developer',
 'Lập trình viên mobile - xây dựng ứng dụng di động',
 '["React Native", "Flutter", "Swift", "Kotlin", "REST API", "Git"]', 'mid'),

((SELECT id FROM kb_industries WHERE slug = 'it'), 'DevOps Engineer', 'devops-engineer',
 'Kỹ sư DevOps - CI/CD, infrastructure, cloud',
 '["Docker", "Kubernetes", "AWS/GCP", "CI/CD", "Linux", "Terraform", "Monitoring"]', 'mid'),

((SELECT id FROM kb_industries WHERE slug = 'it'), 'QA/Tester', 'qa-tester',
 'Kiểm thử phần mềm - manual & automation testing',
 '["Test Case Design", "Selenium", "Postman", "SQL", "Jira", "Agile"]', 'mid'),

((SELECT id FROM kb_industries WHERE slug = 'it'), 'Business Analyst', 'business-analyst',
 'Phân tích nghiệp vụ - cầu nối giữa business và kỹ thuật',
 '["Requirements Analysis", "UML", "SQL", "Jira", "Agile", "Communication"]', 'mid'),

((SELECT id FROM kb_industries WHERE slug = 'it'), 'Data Analyst', 'data-analyst',
 'Phân tích dữ liệu - SQL, visualization, insights',
 '["SQL", "Python", "Excel", "Power BI/Tableau", "Statistics", "Data Modeling"]', 'mid'),

((SELECT id FROM kb_industries WHERE slug = 'it'), 'Project Manager', 'project-manager',
 'Quản lý dự án CNTT',
 '["Agile/Scrum", "Jira", "Risk Management", "Stakeholder Management", "Communication"]', 'mid'),

((SELECT id FROM kb_industries WHERE slug = 'it'), 'UI/UX Designer', 'ui-ux-designer',
 'Thiết kế giao diện và trải nghiệm người dùng',
 '["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"]', 'mid');

-- ── 50+ Questions for IT roles ──

-- === CONFIDENCE (tự tin) - 10 câu ===
INSERT INTO kb_questions (role_template_id, category, topic, difficulty, question_text, follow_ups, sample_answers, scoring_rubric, tags) VALUES
(NULL, 'confidence', 'Giới thiệu bản thân', 'entry',
 'Bạn hãy giới thiệu ngắn gọn về bản thân và lý do bạn quan tâm đến vị trí này.',
 '["Điều gì khiến bạn chọn ngành này?", "Bạn thấy mình phù hợp ở điểm nào?"]',
 '{"good": {"text": "Em tên là [tên], hiện đang là sinh viên năm cuối ngành CNTT tại [trường]. Em đã có kinh nghiệm thực tập 6 tháng tại [công ty] ở vị trí Backend Developer, nơi em được làm việc với Java Spring Boot và PostgreSQL. Em quan tâm đến vị trí này vì muốn phát triển sâu hơn về microservices và cloud, đồng thời văn hóa công ty rất phù hợp với định hướng của em.", "score": 9, "explanation": "Giới thiệu ngắn gọn, có cấu trúc, nêu rõ kinh nghiệm và động lực"}, "medium": {"text": "Em tên là [tên], em đang học CNTT. Em thích lập trình nên muốn apply vào đây.", "score": 5, "explanation": "Quá ngắn, thiếu chi tiết về kinh nghiệm và động lực cụ thể"}, "bad": {"text": "Dạ, em... ờ... em tên là... em cũng không biết nói gì nhiều, em thấy đăng tuyển nên em apply thử.", "score": 2, "explanation": "Thiếu tự tin, không chuẩn bị, không có cấu trúc"}}',
 '{"keyPoints": ["Giới thiệu có cấu trúc", "Nêu kinh nghiệm liên quan", "Giải thích động lực rõ ràng"], "redFlags": ["Nói quá ngắn", "Thiếu tự tin rõ rệt", "Không chuẩn bị"]}',
 '["giới thiệu", "motivation", "general"]'),

(NULL, 'confidence', 'Điểm mạnh', 'entry',
 'Bạn tự đánh giá điểm mạnh lớn nhất của mình là gì? Cho ví dụ cụ thể.',
 '["Điểm mạnh đó đã giúp bạn như thế nào trong công việc?"]',
 '{"good": {"text": "Điểm mạnh lớn nhất của em là khả năng tự học nhanh. Ví dụ, khi dự án cần chuyển sang dùng Kubernetes, em đã tự học trong 2 tuần và deploy được hệ thống microservices lên cluster. Team lead khen em là người pick up nhanh nhất team.", "score": 9, "explanation": "Có ví dụ cụ thể, có kết quả đo lường được"}, "medium": {"text": "Em nghĩ điểm mạnh của em là chăm chỉ và ham học hỏi.", "score": 5, "explanation": "Chung chung, không có ví dụ cụ thể"}, "bad": {"text": "Em cũng không biết nữa... có lẽ là em cũng ổn.", "score": 2, "explanation": "Không tự tin, không xác định được điểm mạnh"}}',
 '{"keyPoints": ["Xác định rõ điểm mạnh", "Ví dụ cụ thể", "Kết quả đo lường được"], "redFlags": ["Không nêu được điểm mạnh", "Quá chung chung", "Thiếu tự tin"]}',
 '["điểm mạnh", "self-assessment", "general"]'),

((SELECT id FROM kb_role_templates WHERE slug = 'backend-developer'), 'confidence', 'Tech stack preference', 'mid',
 'Bạn thích làm việc với tech stack nào nhất và tại sao? Bạn đã dùng nó trong dự án thực tế chưa?',
 '["So sánh với tech stack khác bạn đã dùng?", "Hạn chế lớn nhất của stack đó là gì?"]',
 '{"good": {"text": "Em thích nhất là Java Spring Boot vì ecosystem rất mature, có đầy đủ giải pháp cho mọi vấn đề. Em đã dùng Spring Boot trong dự án e-commerce với 10k users, kết hợp Spring Security cho auth, Spring Data JPA cho database, và Spring Cloud cho microservices. So với Node.js mà em cũng đã dùng, Spring Boot mạnh hơn về type safety và performance cho hệ thống lớn, nhưng learning curve cao hơn.", "score": 9, "explanation": "Giải thích lý do rõ ràng, có kinh nghiệm thực tế, so sánh khách quan"}, "medium": {"text": "Em dùng Spring Boot vì công ty bắt dùng.", "score": 4, "explanation": "Không thể hiện sự chủ động hoặc hiểu biết sâu"}, "bad": {"text": "Em biết nhiều ngôn ngữ lắm, cái nào cũng được.", "score": 2, "explanation": "Không rõ ràng, không có chiều sâu"}}',
 '{"keyPoints": ["Giải thích lý do chọn", "Kinh nghiệm thực tế", "So sánh khách quan"], "redFlags": ["Không có ý kiến riêng", "Không có kinh nghiệm thực tế"]}',
 '["tech stack", "backend", "preference"]'),

-- === COMMUNICATION (giao tiếp) - 10 câu ===
(NULL, 'communication', 'Giải thích kỹ thuật', 'mid',
 'Bạn hãy giải thích khái niệm API cho một người không biết gì về lập trình.',
 '["Còn REST API thì sao?", "Làm sao để giải thích cho khách hàng hiểu?"]',
 '{"good": {"text": "API giống như menu của một nhà hàng. Khi bạn đến nhà hàng, bạn không vào bếp tự nấu mà nhìn menu để chọn món. Menu liệt kê những gì bếp có thể làm. Bạn gọi món (gửi yêu cầu), bếp nấu (xử lý), rồi trả về món ăn (kết quả). API cũng vậy - nó là danh sách những chức năng mà phần mềm cung cấp, các phần mềm khác gọi đến để lấy dữ liệu hoặc thực hiện hành động.", "score": 9, "explanation": "Dùng ví dụ đời thường, dễ hiểu, chính xác về mặt kỹ thuật"}, "medium": {"text": "API là Application Programming Interface, dùng để kết nối các hệ thống với nhau.", "score": 5, "explanation": "Đúng nhưng không dễ hiểu cho người không biết kỹ thuật"}, "bad": {"text": "API là cái mà backend expose endpoint cho frontend gọi REST request.", "score": 3, "explanation": "Dùng quá nhiều thuật ngữ, người không biết kỹ thuật không hiểu"}}',
 '{"keyPoints": ["Dùng ví dụ đời thường", "Đơn giản hóa khái niệm", "Chính xác kỹ thuật"], "redFlags": ["Dùng quá nhiều jargon", "Giải thích dài dòng", "Không chính xác"]}',
 '["communication", "explain", "general"]'),

(NULL, 'communication', 'Làm việc nhóm', 'entry',
 'Bạn đã từng làm việc nhóm chưa? Hãy kể về một lần làm việc nhóm thành công.',
 '["Vai trò của bạn trong nhóm là gì?", "Bạn xử lý conflict trong nhóm thế nào?"]',
 '{"good": {"text": "Trong đồ án cuối kỳ, nhóm em 5 người làm app quản lý chi tiêu. Em làm team lead, phân công task bằng Trello, mỗi tuần họp 2 lần qua Discord. Khi 2 bạn tranh luận về dùng Firebase hay MySQL, em tổ chức buổi so sánh pros/cons rồi cả nhóm vote. Kết quả cuối cùng đạt 9.5 điểm và được thầy khen về teamwork.", "score": 9, "explanation": "Kể có cấu trúc STAR, vai trò rõ ràng, kết quả cụ thể"}, "medium": {"text": "Em có làm nhóm trong đồ án, mọi người phân công nhau làm, cuối cùng hoàn thành đúng hạn.", "score": 5, "explanation": "Thiếu chi tiết, không nêu vai trò cụ thể"}, "bad": {"text": "Em thường thích làm một mình hơn vì nhóm hay có người không làm.", "score": 3, "explanation": "Thái độ tiêu cực về teamwork"}}',
 '{"keyPoints": ["Vai trò rõ ràng", "Cách giải quyết conflict", "Kết quả đo được"], "redFlags": ["Không muốn làm nhóm", "Đổ lỗi cho người khác"]}',
 '["teamwork", "communication", "general"]'),

(NULL, 'communication', 'Nhận feedback', 'mid',
 'Khi nhận feedback tiêu cực từ sếp hoặc đồng nghiệp, bạn thường phản ứng như thế nào?',
 '["Cho ví dụ cụ thể một lần bạn nhận feedback tiêu cực?"]',
 '{"good": {"text": "Em coi feedback tiêu cực là cơ hội để cải thiện. Ví dụ, senior từng review code em và nói code thiếu unit test, naming convention không nhất quán. Em không bào chữa mà ghi nhận, hỏi thêm về convention của team, rồi viết lại code với full test coverage. Từ đó em luôn tự review code trước khi submit PR.", "score": 9, "explanation": "Thái độ tích cực, có ví dụ cụ thể, có hành động cải thiện"}, "medium": {"text": "Em cũng buồn nhưng cố gắng sửa.", "score": 5, "explanation": "Thái độ ổn nhưng thiếu ví dụ và hành động cụ thể"}, "bad": {"text": "Em nghĩ feedback nên constructive, nhiều khi người ta chỉ trích không đúng.", "score": 3, "explanation": "Thái độ phòng thủ"}}',
 '{"keyPoints": ["Thái độ cầu thị", "Ví dụ cụ thể", "Hành động cải thiện"], "redFlags": ["Phòng thủ", "Đổ lỗi", "Không chấp nhận feedback"]}',
 '["feedback", "communication", "attitude"]'),

-- === PROBLEM_SOLVING (giải quyết vấn đề) - 10 câu ===
((SELECT id FROM kb_role_templates WHERE slug = 'backend-developer'), 'problem_solving', 'Production bug', 'mid',
 'Khi bạn phát hiện một bug nghiêm trọng trên production lúc 10h đêm, quy trình xử lý của bạn như thế nào?',
 '["Bạn dùng công cụ gì để debug?", "Làm sao để ngăn bug tương tự xảy ra lần sau?"]',
 '{"good": {"text": "Đầu tiên em sẽ đánh giá severity: ảnh hưởng bao nhiêu users, có mất data không. Nếu critical, em hotfix ngay - rollback nếu cần. Cụ thể: check logs (ELK/CloudWatch), xác định root cause, viết fix nhỏ nhất có thể, test trên staging, rồi deploy. Song song đó em thông báo team qua Slack. Sau khi fix, em viết postmortem để team rút kinh nghiệm và thêm monitoring/alert cho case tương tự.", "score": 9, "explanation": "Quy trình rõ ràng, có đánh giá severity, có postmortem"}, "medium": {"text": "Em sẽ check log rồi fix bug.", "score": 5, "explanation": "Quá đơn giản, thiếu quy trình"}, "bad": {"text": "Em sẽ để sáng hôm sau fix vì 10h đêm rồi.", "score": 2, "explanation": "Thiếu trách nhiệm với production issue"}}',
 '{"keyPoints": ["Đánh giá severity", "Quy trình debug rõ ràng", "Communication với team", "Postmortem"], "redFlags": ["Không quan tâm severity", "Không có quy trình", "Thiếu trách nhiệm"]}',
 '["production", "debugging", "backend", "incident"]'),

((SELECT id FROM kb_role_templates WHERE slug = 'backend-developer'), 'problem_solving', 'Performance optimization', 'mid',
 'API của bạn đang response chậm (>3 giây). Bạn sẽ tiếp cận vấn đề này như thế nào để tối ưu?',
 '["Bạn đã dùng tool nào để profiling?", "Caching strategy của bạn như thế nào?"]',
 '{"good": {"text": "Em sẽ tiếp cận theo từng layer: 1) Profiling - dùng APM tool (New Relic/Datadog) xác định bottleneck ở đâu: DB query, external API call, hay business logic. 2) Database - EXPLAIN ANALYZE các query chậm, thêm index, optimize N+1 query. 3) Caching - Redis cache cho data ít thay đổi, HTTP caching. 4) Code - async processing cho non-critical tasks, connection pooling. Ví dụ thực tế: em từng giảm response time từ 4s xuống 200ms bằng cách thêm composite index và cache result của aggregation query.", "score": 9, "explanation": "Tiếp cận có hệ thống, có ví dụ thực tế với số liệu"}, "medium": {"text": "Em sẽ thêm index vào database và dùng cache.", "score": 5, "explanation": "Đúng nhưng thiếu systematic approach"}, "bad": {"text": "Em sẽ tăng RAM server lên.", "score": 2, "explanation": "Giải pháp sai hướng, không phân tích root cause"}}',
 '{"keyPoints": ["Systematic profiling", "Database optimization", "Caching strategy", "Số liệu cụ thể"], "redFlags": ["Không phân tích root cause", "Giải pháp chung chung", "Throw hardware at the problem"]}',
 '["performance", "optimization", "backend", "database"]'),

(NULL, 'problem_solving', 'Deadline pressure', 'entry',
 'Bạn được giao task mà deadline rất gấp, không thể hoàn thành hết. Bạn sẽ xử lý thế nào?',
 '["Bạn đã từng gặp tình huống này chưa?", "Bạn sẽ communicate với PM/lead như thế nào?"]',
 '{"good": {"text": "Đầu tiên em sẽ chia task thành các phần nhỏ và đánh giá priority (must-have vs nice-to-have). Sau đó em báo PM/lead ngay lập tức: nêu rõ đã làm được gì, còn gì chưa, và đề xuất 2 options - hoặc extend deadline, hoặc cắt scope phần nice-to-have. Em sẽ không âm thầm làm overtime rồi deliver kém chất lượng. Trong đồ án, em từng gặp case này và đề xuất chia release thành 2 phase, team đồng ý và cuối cùng deliver đúng chất lượng.", "score": 9, "explanation": "Prioritize, communicate sớm, đề xuất giải pháp"}, "medium": {"text": "Em sẽ cố gắng làm overtime để hoàn thành.", "score": 5, "explanation": "Có effort nhưng thiếu communication và prioritization"}, "bad": {"text": "Em sẽ cố làm hết, nếu không kịp thì cũng đã cố rồi.", "score": 3, "explanation": "Thiếu proactive communication"}}',
 '{"keyPoints": ["Prioritization", "Communicate sớm", "Đề xuất giải pháp", "Không sacrifice quality"], "redFlags": ["Âm thầm làm overtime", "Không communicate", "Sacrifice quality"]}',
 '["deadline", "time management", "general"]'),

(NULL, 'problem_solving', 'Tình huống mới', 'mid',
 'Bạn được assign vào dự án dùng công nghệ bạn chưa biết. Bạn sẽ approach như thế nào?',
 '["Bạn đã tự học công nghệ mới bao giờ chưa? Kể lại quá trình?"]',
 '{"good": {"text": "Em sẽ chia thành 3 giai đoạn: 1) Tuần đầu - đọc docs chính thức, xem quick start tutorial, setup hello world. 2) Tuần 2 - đọc codebase hiện tại, hỏi senior về architecture decisions, tìm hiểu convention của team. 3) Tuần 3+ - bắt đầu nhận task nhỏ, code review để học best practices. Song song đó em tham gia community (Discord, StackOverflow). Ví dụ em từng tự học Kubernetes trong 3 tuần theo cách này.", "score": 9, "explanation": "Có kế hoạch rõ ràng, kết hợp nhiều nguồn học, có ví dụ"}, "medium": {"text": "Em sẽ xem YouTube tutorial rồi bắt đầu code.", "score": 5, "explanation": "Cách tiếp cận đơn giản, thiếu kế hoạch"}, "bad": {"text": "Em sẽ nói với PM là em không biết công nghệ này.", "score": 2, "explanation": "Không có initiative học hỏi"}}',
 '{"keyPoints": ["Kế hoạch học cụ thể", "Kết hợp nhiều nguồn", "Proactive", "Ví dụ thực tế"], "redFlags": ["Từ chối học", "Không có kế hoạch"]}',
 '["learning", "self-study", "general"]'),

-- === EXPERTISE (chuyên môn) - 12 câu ===
((SELECT id FROM kb_role_templates WHERE slug = 'backend-developer'), 'expertise', 'Database design', 'mid',
 'Bạn thiết kế database cho hệ thống e-commerce. Hãy mô tả các bảng chính và mối quan hệ.',
 '["Bạn xử lý concurrent orders như thế nào?", "Index strategy của bạn?"]',
 '{"good": {"text": "Các bảng chính: users, products, categories (self-referencing), orders, order_items, payments, inventory. Quan hệ: users 1-N orders, orders 1-N order_items, order_items N-1 products, products N-1 categories, orders 1-1 payments. Để xử lý concurrent: dùng optimistic locking (version column) cho inventory, database transaction SERIALIZABLE cho payment. Index: composite index trên (user_id, created_at) cho orders, GIN index trên product tags.", "score": 9, "explanation": "Thiết kế đầy đủ, giải thích concurrency và indexing"}, "medium": {"text": "Em tạo bảng products, users, orders rồi join lại.", "score": 5, "explanation": "Cơ bản đúng nhưng thiếu chi tiết"}, "bad": {"text": "Em để hết vào 1 bảng cho đơn giản.", "score": 1, "explanation": "Vi phạm nguyên tắc normalization cơ bản"}}',
 '{"keyPoints": ["Schema đầy đủ", "Quan hệ rõ ràng", "Concurrency handling", "Indexing strategy"], "redFlags": ["Thiếu normalization", "Không biết về index", "Bỏ qua concurrency"]}',
 '["database", "design", "backend", "sql"]'),

((SELECT id FROM kb_role_templates WHERE slug = 'backend-developer'), 'expertise', 'REST API design', 'mid',
 'Bạn thiết kế REST API cho module quản lý users. Hãy liệt kê các endpoints và giải thích.',
 '["Bạn xử lý authentication như thế nào?", "Versioning API?"]',
 '{"good": {"text": "GET /api/v1/users - list users (pagination, filter), GET /api/v1/users/{id} - get by id, POST /api/v1/users - create, PUT /api/v1/users/{id} - update, DELETE /api/v1/users/{id} - soft delete. Auth: JWT Bearer token, refresh token rotation. Response format chuẩn: {data, meta, errors}. Status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found. Versioning bằng URL prefix /api/v1/.", "score": 9, "explanation": "RESTful đúng chuẩn, có auth, versioning, error handling"}, "medium": {"text": "POST /getUser, POST /createUser, POST /deleteUser.", "score": 4, "explanation": "Không RESTful - dùng POST cho mọi thứ, verb trong URL"}, "bad": {"text": "Em tạo 1 endpoint /api rồi truyền action trong body.", "score": 1, "explanation": "Hoàn toàn không RESTful"}}',
 '{"keyPoints": ["HTTP methods đúng", "URL naming convention", "Status codes", "Auth & versioning"], "redFlags": ["Verb trong URL", "POST cho mọi thứ", "Không có versioning"]}',
 '["rest api", "design", "backend"]'),

((SELECT id FROM kb_role_templates WHERE slug = 'backend-developer'), 'expertise', 'Microservices', 'senior',
 'Bạn có kinh nghiệm với microservices không? Khi nào nên dùng monolith, khi nào nên chuyển sang microservices?',
 '["Communication giữa các services thế nào?", "Bạn xử lý distributed transaction ra sao?"]',
 '{"good": {"text": "Monolith phù hợp khi team nhỏ (<5 dev), domain chưa rõ ràng, MVP cần ship nhanh. Chuyển sang microservices khi: cần scale independent (VD: payment service scale khác product service), team lớn cần deploy độc lập, hoặc có bounded context rõ ràng. Communication: sync qua REST/gRPC cho query, async qua message queue (RabbitMQ/Kafka) cho events. Distributed transaction: Saga pattern - choreography cho flow đơn giản, orchestration cho flow phức tạp. Cần đi kèm: service discovery, circuit breaker, distributed tracing.", "score": 9, "explanation": "Hiểu trade-offs, biết khi nào dùng, giải pháp cho distributed problems"}, "medium": {"text": "Microservices là chia nhỏ ứng dụng thành nhiều service, gọi nhau qua API.", "score": 5, "explanation": "Định nghĩa đúng nhưng thiếu chiều sâu"}, "bad": {"text": "Microservices tốt hơn monolith trong mọi trường hợp.", "score": 2, "explanation": "Hiểu sai - không có silver bullet"}}',
 '{"keyPoints": ["Trade-off analysis", "Communication patterns", "Distributed transactions", "Khi nào nên/không nên"], "redFlags": ["Silver bullet thinking", "Không biết về challenges", "Thiếu kinh nghiệm thực tế"]}',
 '["microservices", "architecture", "backend", "senior"]'),

((SELECT id FROM kb_role_templates WHERE slug = 'backend-developer'), 'expertise', 'Git workflow', 'entry',
 'Bạn dùng Git trong dự án như thế nào? Mô tả workflow khi phát triển một feature mới.',
 '["Bạn xử lý merge conflict thế nào?", "Bạn dùng rebase hay merge?"]',
 '{"good": {"text": "Em dùng Git Flow: từ develop tạo feature branch (feature/add-auth), code xong thì push và tạo PR. PR cần ít nhất 1 approval, CI pipeline pass. Merge vào develop bằng squash merge để history sạch. Khi release thì tạo release branch từ develop, test, rồi merge vào main và tag version. Conflict: em pull develop mới nhất, resolve conflict local, test kỹ rồi mới push.", "score": 9, "explanation": "Hiểu Git Flow, có PR review process, CI/CD"}, "medium": {"text": "Em tạo branch, code xong push rồi merge.", "score": 5, "explanation": "Biết cơ bản nhưng thiếu workflow cụ thể"}, "bad": {"text": "Em commit thẳng vào main.", "score": 2, "explanation": "Không có branching strategy, rất rủi ro"}}',
 '{"keyPoints": ["Branching strategy rõ ràng", "PR review process", "Conflict resolution", "CI/CD integration"], "redFlags": ["Commit thẳng main", "Không biết branching", "Không review code"]}',
 '["git", "workflow", "version control"]'),

((SELECT id FROM kb_role_templates WHERE slug = 'frontend-developer'), 'expertise', 'React state management', 'mid',
 'Bạn quản lý state trong React application như thế nào? Khi nào dùng local state, khi nào dùng global state?',
 '["Context vs Redux vs Zustand?", "Bạn xử lý async state thế nào?"]',
 '{"good": {"text": "Local state (useState) cho UI state đơn giản: form inputs, toggle, modal. Global state cho data chia sẻ giữa nhiều components: user auth, cart, theme. Em thích Zustand vì simple API, ít boilerplate hơn Redux. Server state em dùng TanStack Query - auto caching, invalidation, optimistic updates. Ví dụ: trong e-commerce, cart dùng Zustand (persist localStorage), product list dùng TanStack Query (cache 5 phút, staleWhileRevalidate).", "score": 9, "explanation": "Phân biệt rõ local/global/server state, có ví dụ thực tế"}, "medium": {"text": "Em dùng Redux cho mọi thứ.", "score": 5, "explanation": "Over-engineering, không phân biệt state types"}, "bad": {"text": "Em truyền props từ trên xuống, state để ở component cha.", "score": 3, "explanation": "Prop drilling, không scalable"}}',
 '{"keyPoints": ["Phân biệt state types", "Tool phù hợp cho từng case", "Server state management", "Ví dụ thực tế"], "redFlags": ["Redux cho mọi thứ", "Prop drilling", "Không biết server state"]}',
 '["react", "state management", "frontend"]'),

((SELECT id FROM kb_role_templates WHERE slug = 'frontend-developer'), 'expertise', 'CSS & Responsive', 'entry',
 'Bạn approach responsive design như thế nào? Giải thích mobile-first.',
 '["Flexbox vs Grid khi nào?", "Bạn dùng media query hay container query?"]',
 '{"good": {"text": "Mobile-first nghĩa là code CSS cho mobile trước (base styles), rồi dùng min-width media queries để thêm cho tablet/desktop. Lý do: mobile users chiếm 60-70%, code ít CSS hơn vì mobile layout đơn giản. Em dùng Tailwind CSS responsive prefixes (sm:, md:, lg:). Layout: Flexbox cho 1 chiều (navbar, card row), Grid cho 2 chiều (dashboard layout). Em luôn test trên Chrome DevTools với nhiều viewport sizes.", "score": 9, "explanation": "Hiểu mobile-first đúng, có số liệu, biết dùng tool"}, "medium": {"text": "Em dùng Bootstrap responsive classes.", "score": 5, "explanation": "Dùng framework nhưng không hiểu nguyên lý"}, "bad": {"text": "Em set width pixel cố định cho mỗi màn hình.", "score": 2, "explanation": "Không responsive, hardcode pixels"}}',
 '{"keyPoints": ["Mobile-first approach", "Flexbox vs Grid", "Testing responsive", "Tailwind/framework usage"], "redFlags": ["Fixed pixels", "Không biết media queries", "Chỉ test 1 screen size"]}',
 '["css", "responsive", "frontend", "mobile-first"]'),

((SELECT id FROM kb_role_templates WHERE slug = 'qa-tester'), 'expertise', 'Test case design', 'mid',
 'Bạn thiết kế test case cho chức năng đăng nhập. Hãy liệt kê các test case quan trọng.',
 '["Bạn dùng technique nào để design test case?", "Automation test cho login?"]',
 '{"good": {"text": "Positive: login đúng email/password, login với remember me, login sau logout. Negative: sai password, sai email, email không tồn tại, để trống fields, SQL injection trong input, XSS trong input. Boundary: password min/max length, email format validation. Edge: login concurrent 2 sessions, login khi account bị lock (5 lần sai), login bằng email uppercase. Non-functional: response time <2s, brute force protection. Technique: equivalence partitioning cho input, boundary value analysis cho password length.", "score": 9, "explanation": "Test case đầy đủ: positive, negative, boundary, edge, security, non-functional"}, "medium": {"text": "Test đúng password, sai password, để trống.", "score": 5, "explanation": "Chỉ có basic positive/negative"}, "bad": {"text": "Em test login đúng là được.", "score": 2, "explanation": "Chỉ happy path, thiếu hoàn toàn negative testing"}}',
 '{"keyPoints": ["Positive + Negative tests", "Boundary values", "Security testing", "Non-functional"], "redFlags": ["Chỉ happy path", "Thiếu security test", "Không có edge cases"]}',
 '["testing", "test case", "qa", "login"]'),

((SELECT id FROM kb_role_templates WHERE slug = 'business-analyst'), 'expertise', 'Requirements gathering', 'mid',
 'Khách hàng nói "Tôi muốn một ứng dụng quản lý nhân sự". Bạn sẽ hỏi những gì để clarify requirements?',
 '["Bạn dùng tool gì để document requirements?", "User story format?"]',
 '{"good": {"text": "Em sẽ hỏi theo framework: WHO - ai sử dụng (HR, manager, employee)? WHAT - chức năng core là gì (chấm công, payroll, tuyển dụng, đánh giá)? WHY - pain point hiện tại? HOW - quy trình hiện tại thế nào? WHEN - deadline, priority features? CONSTRAINTS - budget, existing systems cần integrate, compliance? Sau đó em viết user stories: As a [role], I want [feature], so that [benefit]. Dùng Jira để track, Confluence để document, draw.io cho process flow.", "score": 9, "explanation": "Framework rõ ràng, hỏi đầy đủ các khía cạnh, có tool"}, "medium": {"text": "Em hỏi cần chức năng gì rồi viết spec.", "score": 5, "explanation": "Quá đơn giản, thiếu framework"}, "bad": {"text": "Em sẽ bắt đầu thiết kế database luôn.", "score": 2, "explanation": "Skip requirements gathering hoàn toàn"}}',
 '{"keyPoints": ["Framework hỏi rõ ràng", "User stories", "Documentation tools", "Stakeholder identification"], "redFlags": ["Skip requirements", "Không hỏi WHY", "Giả định thay vì hỏi"]}',
 '["requirements", "business analysis", "stakeholder"]'),

-- === ATTITUDE (thái độ) - 10 câu ===
(NULL, 'attitude', 'Motivation', 'entry',
 'Tại sao bạn muốn làm việc trong ngành này? Động lực lớn nhất của bạn là gì?',
 '["5 năm tới bạn thấy mình ở đâu?", "Điều gì khiến bạn muốn đi làm mỗi sáng?"]',
 '{"good": {"text": "Em đam mê công nghệ từ năm lớp 10 khi tự học lập trình game đơn giản bằng Python. Đến đại học, em nhận ra mình thích nhất là giải quyết vấn đề thực tế bằng code - cảm giác deploy sản phẩm mà users dùng thật rất thỏa mãn. Động lực lớn nhất là mỗi ngày đều học được thứ mới, ngành IT thay đổi liên tục nên không bao giờ nhàm chán.", "score": 9, "explanation": "Có câu chuyện cá nhân, đam mê thật sự, dynamic motivation"}, "medium": {"text": "Em thích lập trình vì lương cao và dễ tìm việc.", "score": 4, "explanation": "Thiếu passion, chỉ vì external motivation"}, "bad": {"text": "Bố mẹ em bảo học CNTT.", "score": 2, "explanation": "Không có động lực cá nhân"}}',
 '{"keyPoints": ["Đam mê thật sự", "Câu chuyện cá nhân", "Growth mindset"], "redFlags": ["Chỉ vì tiền", "Không có passion", "Bị ép buộc"]}',
 '["motivation", "passion", "attitude", "general"]'),

(NULL, 'attitude', 'Failure handling', 'mid',
 'Hãy kể về một thất bại lớn nhất trong sự nghiệp hoặc học tập của bạn. Bạn học được gì?',
 '["Nếu quay lại, bạn sẽ làm khác thế nào?"]',
 '{"good": {"text": "Thất bại lớn nhất là dự án freelance đầu tiên - em nhận làm web cho khách hàng mà underestimate scope. Kết quả: trễ deadline 2 tuần, khách hàng không hài lòng, em phải refund 50% phí. Bài học: 1) Luôn estimate x1.5 thời gian, 2) Chia milestone nhỏ và review thường xuyên, 3) Communicate proactively khi có risk. Từ đó em không bao giờ trễ deadline nữa vì luôn buffer time.", "score": 9, "explanation": "Thừa nhận thất bại, phân tích nguyên nhân, rút bài học cụ thể, có thay đổi"}, "medium": {"text": "Em chưa thất bại lớn lắm, mọi thứ khá suôn sẻ.", "score": 4, "explanation": "Không thành thật hoặc thiếu self-awareness"}, "bad": {"text": "Em bị điểm kém vì thầy chấm không công bằng.", "score": 2, "explanation": "Đổ lỗi, không nhận trách nhiệm"}}',
 '{"keyPoints": ["Thừa nhận thất bại", "Phân tích nguyên nhân", "Bài học cụ thể", "Thay đổi sau đó"], "redFlags": ["Đổ lỗi", "Nói chưa thất bại", "Không rút kinh nghiệm"]}',
 '["failure", "learning", "attitude", "general"]'),

(NULL, 'attitude', 'Work-life balance', 'entry',
 'Bạn quan niệm thế nào về work-life balance? Bạn quản lý thời gian cá nhân và công việc ra sao?',
 '["Bạn có sẵn sàng OT không?"]',
 '{"good": {"text": "Em tin rằng work-life balance không phải 50-50 mà là sustainable pace. Trong giờ làm em focus 100%, dùng Pomodoro technique, hạn chế meetings không cần thiết. Ngoài giờ em dành thời gian cho sở thích (đọc tech blog, gym) để recharge. Em sẵn sàng OT khi có urgent deadline hoặc production issue, nhưng nếu OT trở thành thường xuyên thì đó là dấu hiệu cần review lại planning process.", "score": 9, "explanation": "Quan điểm cân bằng, có phương pháp, biết giới hạn"}, "medium": {"text": "Em cũng cố gắng cân bằng, làm xong việc rồi về.", "score": 5, "explanation": "Chung chung, không có phương pháp"}, "bad": {"text": "Em sẵn sàng OT bất cứ lúc nào, công việc là ưu tiên số 1.", "score": 4, "explanation": "Có thể dẫn đến burnout, thiếu sustainable thinking"}}',
 '{"keyPoints": ["Sustainable pace", "Time management method", "Biết giới hạn", "Flexible when needed"], "redFlags": ["Workaholic mindset", "Không có giới hạn", "Quá cứng nhắc"]}',
 '["work-life balance", "attitude", "general"]'),

(NULL, 'attitude', 'Continuous learning', 'mid',
 'Bạn cập nhật kiến thức mới trong ngành như thế nào? Gần đây bạn học được gì?',
 '["Bạn có contribute open source không?", "Bạn đọc blog/newsletter nào?"]',
 '{"good": {"text": "Em follow nhiều nguồn: Daily.dev cho tech news, Martin Fowler blog cho architecture, ThePrimeagen YouTube cho practical tips. Mỗi tuần em dành 3-4 tiếng tự học. Gần đây nhất em đang tìm hiểu về AI/LLM integration trong ứng dụng - đã thử build RAG system đơn giản với LangChain và vector database. Em cũng tham gia meetup VietTech Group hàng tháng để networking và chia sẻ kiến thức.", "score": 9, "explanation": "Có nguồn cụ thể, dedicated time, project thực tế, community"}, "medium": {"text": "Em xem YouTube khi rảnh.", "score": 5, "explanation": "Passive learning, không có plan"}, "bad": {"text": "Em bận quá nên không có thời gian học thêm.", "score": 3, "explanation": "Không prioritize learning trong ngành thay đổi nhanh"}}',
 '{"keyPoints": ["Nguồn học cụ thể", "Dedicated time", "Hands-on practice", "Community involvement"], "redFlags": ["Không học gì mới", "Chỉ passive consumption", "Không có plan"]}',
 '["learning", "continuous improvement", "attitude"]'),

(NULL, 'attitude', 'Sở thích cá nhân', 'entry',
 'Ngoài công việc, bạn có sở thích gì? Sở thích đó có giúp gì cho công việc không?',
 '["Bạn có tham gia cộng đồng nào không?"]',
 '{"good": {"text": "Em thích chơi cờ vua - nó rèn tư duy logic và khả năng nhìn xa (planning ahead), rất hữu ích khi thiết kế architecture. Em cũng thích viết blog kỹ thuật trên viblo.asia, vừa giúp em hiểu sâu hơn vừa build personal brand. Cuối tuần em thường đi gym để maintain sức khỏe - em tin rằng sức khỏe tốt = productivity tốt.", "score": 8, "explanation": "Sở thích liên quan tích cực đến công việc, có giải thích connection"}, "medium": {"text": "Em thích xem phim và chơi game.", "score": 5, "explanation": "Bình thường, không kết nối với công việc"}, "bad": {"text": "Em không có sở thích gì đặc biệt.", "score": 3, "explanation": "Thiếu personality, không thể hiện gì"}}',
 '{"keyPoints": ["Có sở thích rõ ràng", "Connection với công việc", "Well-rounded"], "redFlags": ["Không có sở thích", "Sở thích tiêu cực"]}',
 '["hobbies", "personality", "attitude", "general"]');
