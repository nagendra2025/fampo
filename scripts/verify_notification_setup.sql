-- ============================================
-- VERIFICATION SCRIPT FOR NOTIFICATION SETUP
-- ============================================
-- Run this in Supabase SQL Editor to verify your setup

-- 1. Check if phone_number column exists in profiles table
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('phone_number', 'notifications_enabled', 'sms_enabled')
ORDER BY column_name;

-- 2. Check if app_settings table exists
SELECT 
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'app_settings'
ORDER BY ordinal_position;

-- 3. Check app_settings data (should have one row)
SELECT 
  id,
  notifications_enabled,
  enable_sms,
  updated_at,
  updated_by
FROM app_settings;

-- 4. Check profiles with phone numbers
SELECT 
  id,
  name,
  email,
  phone_number,
  notifications_enabled,
  sms_enabled
FROM profiles
ORDER BY created_at;

-- 5. Count profiles with phone numbers
SELECT 
  COUNT(*) as total_profiles,
  COUNT(phone_number) as profiles_with_phone,
  COUNT(*) - COUNT(phone_number) as profiles_without_phone
FROM profiles;

-- 6. Check profiles with phone numbers and notification preferences
SELECT 
  name,
  email,
  phone_number,
  notifications_enabled,
  sms_enabled,
  CASE 
    WHEN phone_number IS NULL THEN '❌ No phone number'
    WHEN notifications_enabled = false THEN '❌ Notifications disabled'
    WHEN notifications_enabled IS NULL THEN '⚠️ Notifications not set (defaults to enabled)'
    ELSE '✅ Ready for notifications'
  END as status
FROM profiles
ORDER BY name;



