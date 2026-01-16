-- ============================================
-- ADD PROFILE FIELDS FOR FAMILY DISPLAY
-- ============================================
-- This migration adds fields to profiles table for family member display

-- Add profile photo URL
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add date of birth
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add bio/description
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add index on date_of_birth for age calculations
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON profiles(date_of_birth);



