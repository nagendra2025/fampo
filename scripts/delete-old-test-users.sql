-- ============================================
-- DELETE OLD TEST USERS
-- ============================================
-- This script deletes the old test users (user1-4) created on Dec 27, 2025
-- It keeps the new user: adapalanagendra.canada@gmail.com
--
-- WARNING: This permanently deletes all user data!
-- Make sure you want to delete these users before running.
--
-- Users to be deleted:
-- 1. user1@example.com (UID: 151489ab-372e-4b6f-9b95-6dc5eaa4bd13)
-- 2. user2@example.com (UID: ca45fd2b-4a47-46d4-9d2b-e2de3d5a95a1)
-- 3. user3@example.com (UID: 2bbd25c5-4cb7-4b4c-8339-7816e25a4b52)
-- 4. user4@example.com (UID: b6d264de-7a5c-4d20-8bcc-4b5d4caf1e7c)
--
-- User to KEEP:
-- - adapalanagendra.canada@gmail.com (UID: 5e1bb665-1f00-429c-9bc6-a6b0a2de7dce)

-- ============================================
-- STEP 1: Verify users before deletion
-- ============================================
-- Uncomment and run this to see what will be deleted:

-- SELECT 
--   id,
--   email,
--   created_at,
--   CASE 
--     WHEN email IN ('user1@example.com', 'user2@example.com', 'user3@example.com', 'user4@example.com') 
--     THEN 'WILL BE DELETED'
--     ELSE 'WILL BE KEPT'
--   END as status
-- FROM auth.users
-- ORDER BY created_at;

-- ============================================
-- STEP 2: Check data counts before deletion
-- ============================================
-- Uncomment to see how much data will be deleted:

-- -- Check profiles
-- SELECT COUNT(*) as profile_count 
-- FROM profiles 
-- WHERE id IN (
--   '151489ab-372e-4b6f-9b95-6dc5eaa4bd13',
--   'ca45fd2b-4a47-46d4-9d2b-e2de3d5a95a1',
--   '2bbd25c5-4cb7-4b4c-8339-7816e25a4b52',
--   'b6d264de-7a5c-4d20-8bcc-4b5d4caf1e7c'
-- );

-- -- Check events
-- SELECT COUNT(*) as event_count 
-- FROM events 
-- WHERE created_by IN (
--   '151489ab-372e-4b6f-9b95-6dc5eaa4bd13',
--   'ca45fd2b-4a47-46d4-9d2b-e2de3d5a95a1',
--   '2bbd25c5-4cb7-4b4c-8339-7816e25a4b52',
--   'b6d264de-7a5c-4d20-8bcc-4b5d4caf1e7c'
-- );

-- -- Check tasks
-- SELECT COUNT(*) as task_count 
-- FROM tasks 
-- WHERE created_by IN (
--   '151489ab-372e-4b6f-9b95-6dc5eaa4bd13',
--   'ca45fd2b-4a47-46d4-9d2b-e2de3d5a95a1',
--   '2bbd25c5-4cb7-4b4c-8339-7816e25a4b52',
--   'b6d264de-7a5c-4d20-8bcc-4b5d4caf1e7c'
-- );

-- -- Check notes
-- SELECT COUNT(*) as note_count 
-- FROM notes 
-- WHERE created_by IN (
--   '151489ab-372e-4b6f-9b95-6dc5eaa4bd13',
--   'ca45fd2b-4a47-46d4-9d2b-e2de3d5a95a1',
--   '2bbd25c5-4cb7-4b4c-8339-7816e25a4b52',
--   'b6d264de-7a5c-4d20-8bcc-4b5d4caf1e7c'
-- );

-- -- Check announcements
-- SELECT COUNT(*) as announcement_count 
-- FROM announcements 
-- WHERE created_by IN (
--   '151489ab-372e-4b6f-9b95-6dc5eaa4bd13',
--   'ca45fd2b-4a47-46d4-9d2b-e2de3d5a95a1',
--   '2bbd25c5-4cb7-4b4c-8339-7816e25a4b52',
--   'b6d264de-7a5c-4d20-8bcc-4b5d4caf1e7c'
-- );

-- -- Check memories
-- SELECT COUNT(*) as memory_count 
-- FROM memories 
-- WHERE created_by IN (
--   '151489ab-372e-4b6f-9b95-6dc5eaa4bd13',
--   'ca45fd2b-4a47-46d4-9d2b-e2de3d5a95a1',
--   '2bbd25c5-4cb7-4b4c-8339-7816e25a4b52',
--   'b6d264de-7a5c-4d20-8bcc-4b5d4caf1e7c'
-- );

-- ============================================
-- STEP 3: DELETE OLD TEST USERS
-- ============================================
-- ⚠️ WARNING: This will permanently delete all data for these 4 users!
-- Make sure you've verified the users above before running this.

-- Delete the 4 old test users
DELETE FROM auth.users 
WHERE id IN (
  '151489ab-372e-4b6f-9b95-6dc5eaa4bd13',  -- user1@example.com
  'ca45fd2b-4a47-46d4-9d2b-e2de3d5a95a1',  -- user2@example.com
  '2bbd25c5-4cb7-4b4c-8339-7816e25a4b52',  -- user3@example.com
  'b6d264de-7a5c-4d20-8bcc-4b5d4caf1e7c'   -- user4@example.com
);

-- ============================================
-- STEP 4: Verify deletion
-- ============================================
-- After deletion, verify these users are gone:

-- SELECT * FROM auth.users 
-- WHERE email IN ('user1@example.com', 'user2@example.com', 'user3@example.com', 'user4@example.com');
-- -- Should return nothing

-- SELECT * FROM profiles 
-- WHERE id IN (
--   '151489ab-372e-4b6f-9b95-6dc5eaa4bd13',
--   'ca45fd2b-4a47-46d4-9d2b-e2de3d5a95a1',
--   '2bbd25c5-4cb7-4b4c-8339-7816e25a4b52',
--   'b6d264de-7a5c-4d20-8bcc-4b5d4caf1e7c'
-- );
-- -- Should return nothing

-- ============================================
-- STEP 5: Verify new user is still there
-- ============================================
-- Make sure the new user is still present:

-- SELECT id, email, created_at 
-- FROM auth.users 
-- WHERE email = 'adapalanagendra.canada@gmail.com';
-- -- Should return: 5e1bb665-1f00-429c-9bc6-a6b0a2de7dce

-- ============================================
-- NEXT STEP: Clean up storage files
-- ============================================
-- After deleting users, you need to manually delete their storage files:
-- 1. Go to Supabase Dashboard → Storage → memories bucket
-- 2. Delete these folders:
--    - profiles/151489ab-372e-4b6f-9b95-6dc5eaa4bd13/
--    - profiles/ca45fd2b-4a47-46d4-9d2b-e2de3d5a95a1/
--    - profiles/2bbd25c5-4cb7-4b4c-8339-7816e25a4b52/
--    - profiles/b6d264de-7a5c-4d20-8bcc-4b5d4caf1e7c/
-- 3. Keep this folder:
--    - profiles/5e1bb665-1f00-429c-9bc6-a6b0a2de7dce/ (new user)



