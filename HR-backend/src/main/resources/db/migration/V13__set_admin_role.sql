-- Set admin@interviewpro.vn as ADMIN
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@interviewpro.vn';
-- Clean up admin2
DELETE FROM users WHERE email = 'admin2@interviewpro.vn';
