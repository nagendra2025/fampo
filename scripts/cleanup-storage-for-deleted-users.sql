-- ============================================
-- STORAGE CLEANUP FOR DELETED USERS
-- ============================================
-- This script helps identify storage files for the deleted users
-- 
-- Deleted User UUIDs:
-- 1. 151489ab-372e-4b6f-9b95-6dc5eaa4bd13 (user1@example.com)
-- 2. ca45fd2b-4a47-46d4-9d2b-e2de3d5a95a1 (user2@example.com)
-- 3. 2bbd25c5-4cb7-4b4c-8339-7816e25a4b52 (user3@example.com)
-- 4. b6d264de-7a5c-4d20-8bcc-4b5d4caf1e7c (user4@example.com)
--
-- User to KEEP:
-- - 5e1bb665-1f00-429c-9bc6-a6b0a2de7dce (adapalanagendra.canada@gmail.com)

-- ============================================
-- STEP 1: Find storage files for deleted users
-- ============================================
-- This query identifies files in storage that belong to deleted users
-- Note: Supabase Storage doesn't support SQL DELETE, so you'll need to
-- delete these files manually via the Dashboard or Storage API

SELECT 
  name as file_path,
  bucket_id,
  created_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'memories'
AND (
  name LIKE 'profiles/151489ab-372e-4b6f-9b95-6dc5eaa4bd13/%' OR
  name LIKE 'profiles/ca45fd2b-4a47-46d4-9d2b-e2de3d5a95a1/%' OR
  name LIKE 'profiles/2bbd25c5-4cb7-4b4c-8339-7816e25a4b52/%' OR
  name LIKE 'profiles/b6d264de-7a5c-4d20-8bcc-4b5d4caf1e7c/%'
)
ORDER BY created_at DESC;

-- ============================================
-- STEP 2: List all profile folders in storage
-- ============================================
-- This shows all profile folders to help identify which to delete

SELECT DISTINCT
  SPLIT_PART(name, '/', 1) || '/' || SPLIT_PART(name, '/', 2) as folder_path,
  COUNT(*) as file_count
FROM storage.objects
WHERE bucket_id = 'memories'
AND name LIKE 'profiles/%'
GROUP BY SPLIT_PART(name, '/', 1) || '/' || SPLIT_PART(name, '/', 2)
ORDER BY folder_path;

-- ============================================
-- MANUAL CLEANUP INSTRUCTIONS
-- ============================================
-- 
-- To delete storage files for deleted users:
-- 
-- Option 1: Via Supabase Dashboard (Easiest)
-- 1. Go to Storage → memories bucket
-- 2. Navigate to profiles/ folder
-- 3. Delete these folders:
--    - profiles/151489ab-372e-4b6f-9b95-6dc5eaa4bd13/
--    - profiles/ca45fd2b-4a47-46d4-9d2b-e2de3d5a95a1/
--    - profiles/2bbd25c5-4cb7-4b4c-8339-7816e25a4b52/
--    - profiles/b6d264de-7a5c-4d20-8bcc-4b5d4caf1e7c/
-- 4. Keep this folder (DO NOT DELETE):
--    - profiles/5e1bb665-1f00-429c-9bc6-a6b0a2de7dce/
-- 
-- Option 2: Via Supabase Storage API
-- Use DELETE requests to remove files:
-- DELETE /storage/v1/object/memories/profiles/{user-uuid}/{filename}
-- 
-- ============================================
-- VERIFY STORAGE CLEANUP
-- ============================================
-- After manual deletion, verify only new user's files remain:

-- SELECT 
--   name as file_path,
--   created_at
-- FROM storage.objects
-- WHERE bucket_id = 'memories'
-- AND name LIKE 'profiles/%'
-- ORDER BY created_at DESC;
-- -- Should only show files in: profiles/5e1bb665-1f00-429c-9bc6-a6b0a2de7dce/



