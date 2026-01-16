-- ============================================
-- STORAGE BUCKET FOR MEMORIES (PHOTOS)
-- ============================================

-- Create storage bucket for family memories
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for memories bucket
-- All authenticated users can view memories
CREATE POLICY "Authenticated users can view memories"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'memories' AND
    auth.role() = 'authenticated'
  );

-- All authenticated users can upload memories
CREATE POLICY "Authenticated users can upload memories"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'memories' AND
    auth.role() = 'authenticated'
  );

-- All authenticated users can update their own memories
CREATE POLICY "Authenticated users can update memories"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'memories' AND
    auth.role() = 'authenticated'
  );

-- All authenticated users can delete memories
CREATE POLICY "Authenticated users can delete memories"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'memories' AND
    auth.role() = 'authenticated'
  );



