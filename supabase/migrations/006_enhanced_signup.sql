-- ============================================
-- ENHANCED SIGNUP - ADD GENDER FIELD AND UPDATE TRIGGER
-- ============================================
-- This migration adds gender field and updates profile creation trigger
-- to handle all new signup fields: gender, nick_name, punch_line, photo_url, date_of_birth, role

-- Add gender field to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female'));

-- Add nick_name field (separate from name for personalized greeting)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS nick_name TEXT;

-- Update handle_new_user function to accept all new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    name,
    nick_name,
    role, 
    photo_url, 
    date_of_birth,
    gender,
    bio
  )
  VALUES (
    NEW.id,
    NEW.email,
    -- Use nick_name as name if provided, otherwise use email username
    COALESCE(
      NEW.raw_user_meta_data->>'nick_name',
      split_part(NEW.email, '@', 1)
    ),
    -- Store nick_name separately for greeting
    NEW.raw_user_meta_data->>'nick_name',
    -- Role is calculated in signup API and passed via metadata
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    -- Photo URL from metadata
    NEW.raw_user_meta_data->>'photo_url',
    -- Date of birth from metadata
    CASE 
      WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE
      ELSE NULL
    END,
    -- Gender from metadata
    NEW.raw_user_meta_data->>'gender',
    -- Punch line stored as bio
    NEW.raw_user_meta_data->>'punch_line'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index on gender for potential filtering
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);

-- Add index on nick_name for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_nick_name ON profiles(nick_name);



