-- ============================================
-- DELETE USER SCRIPT
-- ============================================
-- This script deletes a specific user and all associated data.
-- 
-- User to DELETE:
-- - nagendrakumar.a99@gmail.com
-- - UID: 0c59db0b-9284-4ca9-82dc-200ca2e03ef4
--
-- WARNING: This permanently deletes all user data!
-- There is no undo!
--
-- Usage:
-- 1. Run Step 1 queries to verify the user.
-- 2. Run Step 2 (optional) to see what data will be deleted.
-- 3. Run Step 3 to execute the deletion.
-- 4. Run Step 4 queries to verify deletion.
-- 5. Manually clean up storage files (see Step 5).
--

-- ============================================
-- STEP 1: VERIFY USER TO BE DELETED
-- ============================================
-- Run this SELECT statement to confirm which user will be affected.

SELECT id, email, created_at
FROM auth.users
WHERE id = '0c59db0b-9284-4ca9-82dc-200ca2e03ef4';

-- Should return 1 row with:
-- - id: 0c59db0b-9284-4ca9-82dc-200ca2e03ef4
-- - email: nagendrakumar.a99@gmail.com

-- ============================================
-- STEP 2: (OPTIONAL) PRE-DELETION DATA CHECK
-- ============================================
-- Run these queries to see how much data will be deleted for this user.

-- Check profile
SELECT COUNT(*) as profile_count 
FROM profiles 
WHERE id = '0c59db0b-9284-4ca9-82dc-200ca2e03ef4';

-- Check events created by this user
SELECT COUNT(*) as event_count 
FROM events 
WHERE created_by = '0c59db0b-9284-4ca9-82dc-200ca2e03ef4';

-- Check tasks created by this user
SELECT COUNT(*) as task_count 
FROM tasks 
WHERE created_by = '0c59db0b-9284-4ca9-82dc-200ca2e03ef4';

-- Check notes created by this user
SELECT COUNT(*) as note_count 
FROM notes 
WHERE created_by = '0c59db0b-9284-4ca9-82dc-200ca2e03ef4';

-- Check announcements created by this user
SELECT COUNT(*) as announcement_count 
FROM announcements 
WHERE created_by = '0c59db0b-9284-4ca9-82dc-200ca2e03ef4';

-- Check memories created by this user
SELECT COUNT(*) as memory_count 
FROM memories 
WHERE created_by = '0c59db0b-9284-4ca9-82dc-200ca2e03ef4';

-- ============================================
-- STEP 3: DELETE THE USER
-- ============================================
-- !!! WARNING: This is the actual deletion step. Proceed with caution. !!!
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

DELETE FROM auth.users
WHERE id = '0c59db0b-9284-4ca9-82dc-200ca2e03ef4';

-- ============================================
-- STEP 4: VERIFY DELETION
-- ============================================
-- Run these SELECT statements to confirm the user and their data are gone.

-- Check auth.users (should return 0 rows)
SELECT id, email 
FROM auth.users 
WHERE id = '0c59db0b-9284-4ca9-82dc-200ca2e03ef4';

-- Check profiles table (should return 0 rows)
SELECT id, email 
FROM profiles 
WHERE id = '0c59db0b-9284-4ca9-82dc-200ca2e03ef4';

-- Check events table (should return 0 rows)
SELECT COUNT(*) as event_count 
FROM events 
WHERE created_by = '0c59db0b-9284-4ca9-82dc-200ca2e03ef4';

-- Check tasks table (should return 0 rows)
SELECT COUNT(*) as task_count 
FROM tasks 
WHERE created_by = '0c59db0b-9284-4ca9-82dc-200ca2e03ef4';

-- Check notes table (should return 0 rows)
SELECT COUNT(*) as note_count 
FROM notes 
WHERE created_by = '0c59db0b-9284-4ca9-82dc-200ca2e03ef4';

-- Check announcements table (should return 0 rows)
SELECT COUNT(*) as announcement_count 
FROM announcements 
WHERE created_by = '0c59db0b-9284-4ca9-82dc-200ca2e03ef4';

-- Check memories table (should return 0 rows)
SELECT COUNT(*) as memory_count 
FROM memories 
WHERE created_by = '0c59db0b-9284-4ca9-82dc-200ca2e03ef4';

-- ============================================
-- STEP 5: MANUAL STORAGE CLEANUP
-- ============================================
-- Storage files (profile pictures and memory photos) are NOT automatically deleted.
-- You must manually delete them in Supabase Storage.
--
-- Instructions:
-- 1. Go to Supabase Dashboard → Storage → 'memories' bucket
-- 2. Navigate to the 'profiles' folder
-- 3. Delete the folder: profiles/0c59db0b-9284-4ca9-82dc-200ca2e03ef4/
-- 4. Navigate to the 'memories' folder (if it exists)
-- 5. Delete any folders/files associated with this user ID
--
-- To find storage files for this user, run this query:
SELECT 
  name as file_path,
  created_at
FROM storage.objects
WHERE bucket_id = 'memories'
AND (
  name LIKE 'profiles/0c59db0b-9284-4ca9-82dc-200ca2e03ef4/%' OR
  name LIKE 'memories/0c59db0b-9284-4ca9-82dc-200ca2e03ef4/%'
)
ORDER BY created_at DESC;

-- After identifying files, delete them manually in Supabase Dashboard:
-- Storage → memories bucket → Find and delete the folders/files

-- ============================================
-- COMPLETE DELETION CHECKLIST
-- ============================================
-- [ ] Step 1: Verified user exists
-- [ ] Step 2: (Optional) Checked data counts
-- [ ] Step 3: Executed DELETE statement
-- [ ] Step 4: Verified deletion in all tables
-- [ ] Step 5: Manually deleted storage files
-- [ ] Verified user no longer appears in Supabase Auth → Users



