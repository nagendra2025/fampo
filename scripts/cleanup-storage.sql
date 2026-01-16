-- ============================================
-- STORAGE CLEANUP SCRIPT
-- ============================================
-- This script helps identify orphaned files in Supabase Storage
-- that don't have matching profiles in the database.
--
-- IMPORTANT: This script only IDENTIFIES orphaned files.
-- Actual deletion must be done via:
-- 1. Supabase Dashboard → Storage → Browse files
-- 2. Supabase Storage API
-- 3. Manual deletion
--
-- Note: Supabase Storage doesn't support SQL DELETE for files.
-- Files must be deleted through the Storage API or Dashboard.

-- ============================================
-- STEP 1: Find orphaned profile photos
-- ============================================
-- This query identifies profile photos that don't have matching profiles
-- Note: This is a reference query. Actual file paths need to be extracted
-- from the storage.objects table or Storage API.

-- Find all profile photos in storage
-- (This query structure is for reference - actual implementation depends on storage API)
SELECT 
  name as file_path,
  bucket_id,
  created_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'memories'
AND name LIKE 'profiles/%'
ORDER BY created_at DESC;

-- ============================================
-- STEP 2: Find profiles without photos
-- ============================================
-- Find profiles that have photo_url but the file might not exist
SELECT 
  id,
  email,
  name,
  photo_url,
  created_at
FROM profiles
WHERE photo_url IS NOT NULL
ORDER BY created_at DESC;

-- ============================================
-- STEP 3: Find profiles with invalid photo URLs
-- ============================================
-- Find profiles where photo_url doesn't match expected pattern
SELECT 
  id,
  email,
  name,
  photo_url
FROM profiles
WHERE photo_url IS NOT NULL
AND photo_url NOT LIKE '%supabase.co/storage/v1/object/public/memories/profiles/%'
ORDER BY created_at DESC;

-- ============================================
-- MANUAL CLEANUP INSTRUCTIONS
-- ============================================
-- 
-- To delete orphaned files:
-- 
-- Option 1: Via Supabase Dashboard
-- 1. Go to Storage → memories bucket
-- 2. Navigate to profiles/ folder
-- 3. Find folders for deleted users
-- 4. Delete the folders manually
-- 
-- Option 2: Via Supabase Storage API
-- Use the Storage API to delete files:
-- DELETE /storage/v1/object/memories/{file_path}
-- 
-- Option 3: Via SQL (if you have direct database access)
-- Note: This requires special permissions and is not recommended
-- 
-- ============================================
-- CLEANUP AFTER USER DELETION
-- ============================================
-- After deleting a user (using delete-user.sql), follow these steps:
-- 
-- 1. Note the user's UUID
-- 2. Go to Storage → memories bucket
-- 3. Look for folder: profiles/{user-uuid}/
-- 4. Delete the entire folder
-- 5. Verify the profile's photo_url is no longer referenced
-- 
-- ============================================
-- PREVENTIVE MEASURES
-- ============================================
-- To prevent orphaned files in the future:
-- 
-- 1. Always delete storage files before deleting users
-- 2. Use the profile photo upload API which handles cleanup
-- 3. Implement a cleanup job that runs periodically
-- 4. Monitor storage usage regularly



