-- ============================================
-- VERIFY RLS POLICIES FOR EDIT RESTRICTIONS
-- ============================================
-- Run this script in Supabase SQL Editor to verify
-- that the migration 008 was applied correctly

-- Check if RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('tasks', 'events', 'notes', 'memories')
ORDER BY tablename;

-- Check all policies on tasks table
SELECT 
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'tasks'
ORDER BY policyname;

-- Check all policies on events table
SELECT 
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'events'
ORDER BY policyname;

-- Check all policies on notes table
SELECT 
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'notes'
ORDER BY policyname;

-- Check all policies on memories table
SELECT 
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'memories'
ORDER BY policyname;

-- Expected Results:
-- =================
-- Tasks table should have:
--   - "Users can update their own tasks" (UPDATE policy with created_by = auth.uid())
--   - "Users can delete their own tasks" (DELETE policy with created_by = auth.uid())
--
-- Events table should have:
--   - "Users can update their own events" (UPDATE policy with created_by = auth.uid())
--   - "Users can delete their own events" (DELETE policy with created_by = auth.uid())
--
-- Notes table should have:
--   - "Parents can update their own notes" (UPDATE policy with created_by = auth.uid() AND parent role check)
--   - "Parents can delete their own notes" (DELETE policy with created_by = auth.uid() AND parent role check)
--
-- Memories table should have:
--   - "Users can update their own memories" (UPDATE policy with created_by = auth.uid())
--   - "Users can delete their own memories" (DELETE policy with created_by = auth.uid())



