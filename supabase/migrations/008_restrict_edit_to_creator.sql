-- ============================================
-- MIGRATION: Restrict Edit/Delete to Creator Only
-- ============================================
-- This migration updates RLS policies to ensure only the creator
-- of a task, event, note, or memory can edit or delete it.

-- ============================================
-- EVENTS TABLE
-- ============================================
-- Drop existing update/delete policies
DROP POLICY IF EXISTS "All authenticated users can update events" ON events;
DROP POLICY IF EXISTS "All authenticated users can delete events" ON events;

-- Create new policies that restrict to creator only
CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.role() = 'authenticated' AND created_by = auth.uid());

CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (auth.role() = 'authenticated' AND created_by = auth.uid());

-- ============================================
-- TASKS TABLE
-- ============================================
-- Drop existing update/delete policies
DROP POLICY IF EXISTS "All authenticated users can update tasks" ON tasks;
DROP POLICY IF EXISTS "All authenticated users can delete tasks" ON tasks;

-- Create new policies that restrict to creator only
CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.role() = 'authenticated' AND created_by = auth.uid());

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.role() = 'authenticated' AND created_by = auth.uid());

-- ============================================
-- NOTES TABLE
-- ============================================
-- Drop existing update/delete policies
DROP POLICY IF EXISTS "Parents can update notes" ON notes;
DROP POLICY IF EXISTS "Parents can delete notes" ON notes;

-- Create new policies that restrict to creator only (still requires parent role)
-- Note: Notes can only be created by parents, so this maintains that restriction
CREATE POLICY "Parents can update their own notes"
  ON notes FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('father', 'mother', 'parent')
    )
  );

CREATE POLICY "Parents can delete their own notes"
  ON notes FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('father', 'mother', 'parent')
    )
  );

-- ============================================
-- MEMORIES TABLE
-- ============================================
-- Drop existing update/delete policies
DROP POLICY IF EXISTS "All authenticated users can update memories" ON memories;
DROP POLICY IF EXISTS "All authenticated users can delete memories" ON memories;

-- Create new policies that restrict to creator only
CREATE POLICY "Users can update their own memories"
  ON memories FOR UPDATE
  USING (auth.role() = 'authenticated' AND created_by = auth.uid());

CREATE POLICY "Users can delete their own memories"
  ON memories FOR DELETE
  USING (auth.role() = 'authenticated' AND created_by = auth.uid());



