-- ============================================
-- ADD NOTIFICATION FIELDS TO PROFILES
-- ============================================
-- This migration adds phone number and notification preferences to profiles table

-- Add phone number (E.164 format: +1234567890)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add notification preferences (default: all enabled)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT true;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT true;

-- Add index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number) WHERE phone_number IS NOT NULL;

-- Add comment for phone number format
COMMENT ON COLUMN profiles.phone_number IS 'Phone number in E.164 format (e.g., +1234567890)';



