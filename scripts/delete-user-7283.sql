-- ============================================
-- DELETE USER SCRIPT (UID ending in 7283)
-- ============================================
-- This script deletes a user and all associated data.
-- 
-- User UID ends with: 7283
--
-- WARNING: This permanently deletes all user data!
-- There is no undo!
--
-- Usage:
-- 1. Run Step 1 to find the user with UID ending in 7283
-- 2. Run Step 2 (optional) to see what data will be deleted
-- 3. Run Step 3 to execute the deletion (replace USER_UUID with actual UUID from Step 1)
-- 4. Run Step 4 queries to verify deletion
-- 5. Manually clean up storage files (see Step 5)
--

-- ============================================
-- STEP 1: FIND USER WITH UID ENDING IN 7283
-- ============================================
-- Run this SELECT statement to find the user:

SELECT id, email, created_at
FROM auth.users
WHERE id::text LIKE '%7283';

-- This will return the user(s) with UID ending in 7283.
-- Copy the full UUID from the result (it will be in the 'id' column).
-- Example result might show:
-- - id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxx7283
-- - email: user@example.com

-- ============================================
-- STEP 2: (OPTIONAL) PRE-DELETION DATA CHECK
-- ============================================
-- Replace 'USER_UUID_HERE' with the actual UUID from Step 1
-- Run these queries to see how much data will be deleted:

-- Check profile
-- SELECT COUNT(*) as profile_count 
-- FROM profiles 
-- WHERE id = 'USER_UUID_HERE';

-- Check events created by this user
-- SELECT COUNT(*) as event_count 
-- FROM events 
-- WHERE created_by = 'USER_UUID_HERE';

-- Check tasks created by this user
-- SELECT COUNT(*) as task_count 
-- FROM tasks 
-- WHERE created_by = 'USER_UUID_HERE';

-- Check notes created by this user
-- SELECT COUNT(*) as note_count 
-- FROM notes 
-- WHERE created_by = 'USER_UUID_HERE';

-- Check announcements created by this user
-- SELECT COUNT(*) as announcement_count 
-- FROM announcements 
-- WHERE created_by = 'USER_UUID_HERE';

-- Check memories created by this user
-- SELECT COUNT(*) as memory_count 
-- FROM memories 
-- WHERE created_by = 'USER_UUID_HERE';

-- ============================================
-- STEP 3: DELETE THE USER
-- ============================================
-- !!! WARNING: This is the actual deletion step. Proceed with caution. !!!
--
-- REPLACE 'USER_UUID_HERE' with the actual UUID from Step 1
--
-- This will delete:
-- - User account (from auth.users)
-- - User's profile (from profiles table) - automatic via CASCADE
-- - All events created by the user - automatic via CASCADE
-- - All tasks created by the user - automatic via CASCADE
-- - All notes created by the user - automatic via CASCADE
-- - All announcements created by the user - automatic via CASCADE
-- - All memories created by the user - automatic via CASCADE
--
-- Note: Storage files (profile pictures, memory photos) are NOT automatically deleted.
-- You must manually delete them in Supabase Storage (see Step 5).

-- DELETE FROM auth.users
-- WHERE id = 'USER_UUID_HERE';

-- OR if you want to delete directly by pattern (be careful!):
-- DELETE FROM auth.users
-- WHERE id::text LIKE '%7283';

-- ============================================
-- STEP 4: VERIFY DELETION
-- ============================================
-- Replace 'USER_UUID_HERE' with the actual UUID from Step 1
-- Run these SELECT statements to confirm the user and their data are gone.

-- Check auth.users (should return 0 rows)
-- SELECT id, email 
-- FROM auth.users 
-- WHERE id = 'USER_UUID_HERE';

-- OR check by pattern:
-- SELECT id, email 
-- FROM auth.users 
-- WHERE id::text LIKE '%7283';

-- Check profiles table (should return 0 rows)
-- SELECT id, email 
-- FROM profiles 
-- WHERE id = 'USER_UUID_HERE';

-- OR check by pattern:
-- SELECT id, email 
-- FROM profiles 
-- WHERE id::text LIKE '%7283';

-- Check events table (should return 0 rows)
-- SELECT COUNT(*) as event_count 
-- FROM events 
-- WHERE created_by = 'USER_UUID_HERE';

-- OR check by pattern:
-- SELECT COUNT(*) as event_count 
-- FROM events 
-- WHERE created_by::text LIKE '%7283';

-- Check tasks table (should return 0 rows)
-- SELECT COUNT(*) as task_count 
-- FROM tasks 
-- WHERE created_by = 'USER_UUID_HERE';

-- OR check by pattern:
-- SELECT COUNT(*) as task_count 
-- FROM tasks 
-- WHERE created_by::text LIKE '%7283';

-- Check notes table (should return 0 rows)
-- SELECT COUNT(*) as note_count 
-- FROM notes 
-- WHERE created_by = 'USER_UUID_HERE';

-- OR check by pattern:
-- SELECT COUNT(*) as note_count 
-- FROM notes 
-- WHERE created_by::text LIKE '%7283';

-- Check announcements table (should return 0 rows)
-- SELECT COUNT(*) as announcement_count 
-- FROM announcements 
-- WHERE created_by = 'USER_UUID_HERE';

-- OR check by pattern:
-- SELECT COUNT(*) as announcement_count 
-- FROM announcements 
-- WHERE created_by::text LIKE '%7283';

-- Check memories table (should return 0 rows)
-- SELECT COUNT(*) as memory_count 
-- FROM memories 
-- WHERE created_by = 'USER_UUID_HERE';

-- OR check by pattern:
-- SELECT COUNT(*) as memory_count 
-- FROM memories 
-- WHERE created_by::text LIKE '%7283';

-- ============================================
-- STEP 5: MANUAL STORAGE CLEANUP
-- ============================================
-- Storage files (profile pictures and memory photos) are NOT automatically deleted.
-- You must manually delete them in Supabase Storage.
--
-- Instructions:
-- 1. Go to Supabase Dashboard → Storage → 'memories' bucket
-- 2. Navigate to the 'profiles' folder
-- 3. Find and delete the folder matching the user's UUID (ending in 7283)
-- 4. Navigate to the 'memories' folder (if it exists)
-- 5. Delete any folders/files associated with this user ID
--
-- To find storage files for this user, run this query (replace USER_UUID_HERE):
-- SELECT 
--   name as file_path,
--   created_at
-- FROM storage.objects
-- WHERE bucket_id = 'memories'
-- AND (
--   name LIKE 'profiles/USER_UUID_HERE/%' OR
--   name LIKE 'memories/USER_UUID_HERE/%'
-- )
-- ORDER BY created_at DESC;

-- Or find by pattern (ending in 7283):
-- SELECT 
--   name as file_path,
--   created_at
-- FROM storage.objects
-- WHERE bucket_id = 'memories'
-- AND (
--   name LIKE 'profiles/%7283/%' OR
--   name LIKE 'memories/%7283/%'
-- )
-- ORDER BY created_at DESC;

-- After identifying files, delete them manually in Supabase Dashboard:
-- Storage → memories bucket → Find and delete the folders/files

-- ============================================
-- QUICK DELETE (If you know the full UUID)
-- ============================================
-- If you already know the full UUID, you can use this single command:
-- (Replace the UUID below with the actual one)

-- DELETE FROM auth.users WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxx7283';

-- ============================================
-- COMPLETE DELETION CHECKLIST
-- ============================================
-- [ ] Step 1: Found user with UID ending in 7283
-- [ ] Step 2: (Optional) Checked data counts
-- [ ] Step 3: Executed DELETE statement (replaced USER_UUID_HERE with actual UUID)
-- [ ] Step 4: Verified deletion in all tables
-- [ ] Step 5: Manually deleted storage files
-- [ ] Verified user no longer appears in Supabase Auth → Users

