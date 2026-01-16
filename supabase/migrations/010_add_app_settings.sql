-- ============================================
-- ADD APPLICATION-LEVEL SETTINGS TABLE
-- ============================================
-- This migration creates a table for application-wide settings
-- including notification controls

-- Create app_settings table (single row for global settings)
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notifications_enabled BOOLEAN DEFAULT true,
  enable_sms BOOLEAN DEFAULT true,
  enable_whatsapp BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Enable RLS on app_settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_settings
-- All authenticated users can view settings
CREATE POLICY "Users can view app settings"
  ON app_settings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated users can update (we'll add admin check in API)
CREATE POLICY "Authenticated users can update app settings"
  ON app_settings FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Insert default settings row if it doesn't exist
INSERT INTO app_settings (id, notifications_enabled, enable_sms, enable_whatsapp)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  true,
  true,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE app_settings IS 'Application-wide settings. Should contain only one row.';



