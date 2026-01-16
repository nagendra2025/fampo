-- ============================================
-- MAKE MEMORIES BUCKET PUBLIC
-- ============================================
-- This migration makes the memories bucket public so images can be accessed
-- via public URLs for display in the Next.js Image component

-- Update the bucket to be public
UPDATE storage.buckets
SET public = true
WHERE id = 'memories';

-- Note: The existing RLS policies still apply for upload/delete operations
-- Public access only allows viewing, not modifying



