-- Seed admin user: admin@interviewpro.vn / admin123
-- Password hash is BCrypt of 'admin123'
INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin@interviewpro.vn',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Admin InterviewPro',
    'ADMIN',
    now(),
    now()
)
ON CONFLICT (email) DO NOTHING;
