-- ============================================
-- BACKFILL EXISTING USER PROFILES
-- ============================================
-- This migration creates profiles for users that existed
-- before the profile auto-creation trigger was set up

-- Insert profiles for existing auth.users that don't have profiles yet
INSERT INTO public.profiles (id, email, name)
SELECT 
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'name',
    split_part(email, '@', 1)
  ) as name
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Optional: Update existing profiles with latest email if it changed
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email != u.email;

