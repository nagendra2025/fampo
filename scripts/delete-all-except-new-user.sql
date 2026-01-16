-- ============================================
-- DELETE ALL USERS EXCEPT NEW USER
-- ============================================
-- This script deletes ALL users EXCEPT the new user
-- adapalanagendra.canada@gmail.com
--
-- ⚠️ WARNING: This will delete ALL users except the one specified!
-- Use this only if you want to keep ONLY the new user.
--
-- User to KEEP:
-- - adapalanagendra.canada@gmail.com (UID: 5e1bb665-1f00-429c-9bc6-a6b0a2de7dce)
--
-- All other users will be DELETED

-- ============================================
-- STEP 1: Verify current users
-- ============================================
-- Uncomment to see all current users:

-- SELECT 
--   id,
--   email,
--   created_at,
--   CASE 
--     WHEN id = '5e1bb665-1f00-429c-9bc6-a6b0a2de7dce' 
--     THEN 'WILL BE KEPT'
--     ELSE 'WILL BE DELETED'
--   END as status
-- FROM auth.users
-- ORDER BY created_at;

-- ============================================
-- STEP 2: DELETE ALL USERS EXCEPT NEW USER
-- ============================================
-- ⚠️ WARNING: This deletes ALL users except the new one!

DELETE FROM auth.users 
WHERE id != '5e1bb665-1f00-429c-9bc6-a6b0a2de7dce';

-- ============================================
-- STEP 3: Verify only new user remains
-- ============================================
-- After deletion, verify:

-- SELECT id, email, created_at 
-- FROM auth.users;
-- -- Should return only: adapalanagendra.canada@gmail.com

-- ============================================
-- STEP 4: Clean up storage files
-- ============================================
-- After deleting users, manually delete their storage folders:
-- 1. Go to Supabase Dashboard → Storage → memories bucket
-- 2. Delete all folders in profiles/ EXCEPT:
--    - profiles/5e1bb665-1f00-429c-9bc6-a6b0a2de7dce/ (keep this one)



