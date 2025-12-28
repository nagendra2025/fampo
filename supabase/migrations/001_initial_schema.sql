-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Stores user profile information linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('father', 'mother', 'son', 'daughter', 'parent', 'child')) DEFAULT 'parent',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- EVENTS TABLE
-- ============================================
-- Family calendar events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  notes TEXT,
  category TEXT NOT NULL CHECK (category IN ('school', 'health', 'travel', 'family')) DEFAULT 'family',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Events RLS Policies
CREATE POLICY "All authenticated users can view events"
  ON events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can create events"
  ON events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update events"
  ON events FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can delete events"
  ON events FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- TASKS TABLE
-- ============================================
-- Personal & family to-do lists
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  due_date DATE,
  assigned_to TEXT CHECK (assigned_to IN ('father', 'mother', 'son', 'daughter', 'all')) DEFAULT 'all',
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Tasks RLS Policies
CREATE POLICY "All authenticated users can view tasks"
  ON tasks FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update tasks"
  ON tasks FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can delete tasks"
  ON tasks FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- NOTES TABLE
-- ============================================
-- Family notes & important information
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('emergency', 'health', 'school', 'general')) DEFAULT 'general',
  is_readonly_for_kids BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Notes RLS Policies
CREATE POLICY "All authenticated users can view notes"
  ON notes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Parents can create notes"
  ON notes FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('father', 'mother', 'parent')
    )
  );

CREATE POLICY "Parents can update notes"
  ON notes FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('father', 'mother', 'parent')
    )
  );

CREATE POLICY "Parents can delete notes"
  ON notes FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('father', 'mother', 'parent')
    )
  );

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================
-- Broadcast short messages without discussion
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Announcements RLS Policies
CREATE POLICY "All authenticated users can view active announcements"
  ON announcements FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    (expires_at IS NULL OR expires_at > NOW())
  );

CREATE POLICY "All authenticated users can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can delete announcements"
  ON announcements FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- MEMORIES TABLE
-- ============================================
-- Family memories with photos and notes
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_url TEXT NOT NULL,
  note TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on memories
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Memories RLS Policies
CREATE POLICY "All authenticated users can view memories"
  ON memories FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can create memories"
  ON memories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update memories"
  ON memories FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can delete memories"
  ON memories FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_announcements_expires_at ON announcements(expires_at);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION TO AUTO-CREATE PROFILE
-- ============================================
-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

