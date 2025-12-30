# Profile Photo Upload Fix - Complete Guide

## Problem
Photos uploaded during signup were not displaying after login. Users only saw their initial letter instead of their profile photo.

## Root Cause
1. **Authentication Issue**: During signup, users are not authenticated yet (email confirmation pending), but storage policies require authentication to upload files.
2. **Timing Issue**: The profile trigger creates the profile immediately when the user is created, but the photo upload happens AFTER user creation, so the profile is created with `photo_url = NULL`.
3. **Update Failure**: The profile update to add the photo URL was failing silently or not persisting.

## Solution Implemented

### 1. Admin Client for Bypassing RLS
- Created `lib/supabase/admin.ts` with service role key
- Uses admin privileges to upload photos and update profiles during signup
- Bypasses Row Level Security (RLS) policies

### 2. Enhanced Photo Upload Flow
- Upload photo using admin client (bypasses auth requirement)
- Update user metadata with photo URL
- Retry logic (10 attempts) to ensure profile exists before updating
- Comprehensive logging for debugging

### 3. Database Function (Optional)
- Created `supabase/migrations/007_fix_profile_photo_update.sql`
- Provides a reliable function to update profile photos
- Falls back to direct update if function doesn't exist

### 4. Better Error Handling
- Detailed console logging at each step
- Verification checks after updates
- Clear error messages if service role key is missing

## Required Setup

### Step 1: Get Service Role Key
1. Go to **Supabase Dashboard** → Your Project
2. Go to **Settings** → **API**
3. Find **"service_role"** key (⚠️ Keep this secret!)
4. Copy the key

### Step 2: Add to Local Environment
Add to `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Add to Vercel
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: (paste your service role key)
   - **Environment**: All Environments (or Production only)
3. Click **Save**
4. **Redeploy** your application

### Step 4: Run Database Migration (Optional but Recommended)
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run `supabase/migrations/007_fix_profile_photo_update.sql`
3. This creates a helper function for more reliable photo updates

## Testing

### 1. Check Environment Variables
Verify both are set:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅ (NEW - required!)

### 2. Test Signup Flow
1. Sign up a new user with a photo
2. Check **Vercel Logs** (or local terminal) for:
   ```
   [SIGNUP] Photo uploaded successfully: https://...
   [SIGNUP] ✅ Profile photo updated successfully!
   [SIGNUP] ✅ Verification: Photo URL correctly saved in database
   ```

### 3. Verify After Login
1. Confirm email and login
2. Check home page - photo should appear in:
   - Greeting section ("Hello [Name]")
   - "Meet the Family" section

### 4. Check Database
Run this SQL in Supabase SQL Editor:
```sql
SELECT id, email, nick_name, photo_url 
FROM profiles 
WHERE email = 'your-test-email@example.com';
```

The `photo_url` should contain a Supabase storage URL.

## Troubleshooting

### Photo Still Not Showing?

1. **Check Vercel Logs**
   - Look for `[SIGNUP]` log messages
   - Check for errors about `SUPABASE_SERVICE_ROLE_KEY`

2. **Verify Service Role Key**
   - Make sure it's set in Vercel environment variables
   - Make sure you copied the **service_role** key, not the **anon** key
   - Redeploy after adding the variable

3. **Check Storage Bucket**
   - Go to Supabase Dashboard → **Storage** → **memories** bucket
   - Verify the bucket is **public** (should be set by migration `004_make_memories_bucket_public.sql`)
   - Check if files exist in `profiles/{userId}/` folder

4. **Check Database**
   ```sql
   -- Check if photo_url is saved
   SELECT id, email, photo_url FROM profiles WHERE email = 'your-email@example.com';
   
   -- Check if photo exists in storage
   SELECT name FROM storage.objects 
   WHERE bucket_id = 'memories' 
   AND name LIKE 'profiles/%';
   ```

5. **Check Browser Console**
   - Open browser DevTools → Console
   - Look for image loading errors
   - Check Network tab for failed image requests

### Common Issues

**Error: "Missing SUPABASE_SERVICE_ROLE_KEY"**
- Solution: Add the environment variable to Vercel and redeploy

**Photo uploads but doesn't show**
- Check if storage bucket is public
- Verify photo_url in database matches the uploaded file path
- Check browser console for CORS or image loading errors

**Profile update fails**
- Check if profile exists (might be timing issue)
- Verify admin client is working (check logs)
- Run migration `007_fix_profile_photo_update.sql` for more reliable updates

## Files Changed

1. `lib/supabase/admin.ts` - NEW: Admin client with service role key
2. `app/api/auth/signup/route.ts` - Enhanced photo upload and profile update logic
3. `app/home/page.tsx` - Added error handling for image loading
4. `supabase/migrations/007_fix_profile_photo_update.sql` - NEW: Database function for photo updates

## Security Notes

⚠️ **IMPORTANT**: 
- The service role key has **full admin access** to your Supabase project
- **NEVER** expose it to the client
- **NEVER** commit it to Git (already in `.gitignore`)
- Only use it in **server-side code** (API routes)
- The admin client is only used in `app/api/auth/signup/route.ts`

## Next Steps

After implementing:
1. ✅ Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel
2. ✅ Redeploy application
3. ✅ Test signup with photo
4. ✅ Verify photo displays after login
5. ✅ Check logs for any errors

If issues persist, check the detailed logs in Vercel to see exactly where the process is failing.

