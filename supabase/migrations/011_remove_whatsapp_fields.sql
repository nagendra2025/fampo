-- ============================================
-- REMOVE WHATSAPP NOTIFICATION FIELDS
-- ============================================
-- This migration removes WhatsApp-related fields from the database
-- as we're moving to SMS-only notifications

-- Remove enable_whatsapp column from app_settings table
ALTER TABLE app_settings
DROP COLUMN IF EXISTS enable_whatsapp;

-- Remove whatsapp_enabled column from profiles table
ALTER TABLE profiles
DROP COLUMN IF EXISTS whatsapp_enabled;

-- Add comment
COMMENT ON TABLE app_settings IS 'Application-wide settings. SMS notifications only.';

