-- ============================================
-- UPDATE USER ROLES - SIMPLE VERSION
-- ============================================
-- Replace the email addresses below with your actual user emails

-- First, see all users to get their emails:
SELECT email, name, role, created_at
FROM profiles
ORDER BY created_at;

-- Then update the roles (REPLACE THE EMAILS BELOW WITH YOUR ACTUAL EMAILS):

-- Update user2 to parent
UPDATE profiles 
SET role = 'parent'
WHERE email = 'REPLACE_WITH_USER2_EMAIL@example.com';

-- Update user3 to kid (son)
UPDATE profiles 
SET role = 'son'
WHERE email = 'REPLACE_WITH_USER3_EMAIL@example.com';

-- Update user4 to kid (daughter)
UPDATE profiles 
SET role = 'daughter'
WHERE email = 'REPLACE_WITH_USER4_EMAIL@example.com';

-- Verify the updates
SELECT email, name, role, created_at
FROM profiles
ORDER BY created_at;



