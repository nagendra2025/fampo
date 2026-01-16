-- ============================================
-- FIX PROFILE PHOTO UPDATE FUNCTION
-- ============================================
-- This migration creates a function to safely update profile photo_url
-- that can be called from the signup API route

-- Function to update profile photo URL (can be called with admin privileges)
CREATE OR REPLACE FUNCTION public.update_profile_photo_url(
  user_id UUID,
  photo_url_value TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update the profile if it exists
  UPDATE public.profiles
  SET photo_url = photo_url_value,
      updated_at = NOW()
  WHERE id = user_id;
  
  -- Return true if a row was updated
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (though we'll use admin client)
GRANT EXECUTE ON FUNCTION public.update_profile_photo_url(UUID, TEXT) TO authenticated;



