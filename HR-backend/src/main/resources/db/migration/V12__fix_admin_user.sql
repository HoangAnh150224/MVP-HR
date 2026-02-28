-- Update admin2 account to ADMIN role
UPDATE users SET role = 'ADMIN' WHERE email = 'admin2@interviewpro.vn';

-- Delete old admin with wrong password hash
DELETE FROM users WHERE email = 'admin@interviewpro.vn' AND role = 'ADMIN';
