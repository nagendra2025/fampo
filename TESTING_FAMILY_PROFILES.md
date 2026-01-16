# Quick Testing Guide - Family Profiles Feature

## Step 1: Apply Database Migration

1. Open Supabase Dashboard → SQL Editor
2. Run the migration file: `supabase/migrations/005_add_profile_fields.sql`
3. Verify columns were added:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'profiles' 
   AND column_name IN ('photo_url', 'date_of_birth', 'bio');
   ```

## Step 2: UI Testing

### Test Home Page - Meet the Family Section

1. **Navigate to Home Page**
   - Login to the application
   - Go to `/home`
   - Scroll down past the feature cards

2. **Verify Display**
   - ✅ "Meet the Family" section appears
   - ✅ All family members shown in grid
   - ✅ Each card shows: photo (or initial), name, role badge, age (if DOB set)
   - ✅ Your profile has a ring border
   - ✅ "View Full Family →" button visible

### Test Family Page

1. **Navigate to Family Page**
   - Click "View Full Family →" OR
   - Click "Family" in navigation OR
   - Go to `/family`

2. **Verify Page**
   - ✅ "Our Family" heading visible
   - ✅ All family members in grid
   - ✅ "Edit Profile" button on your own card only

3. **Test Profile Editing**
   - Click "Edit Profile" on your card
   - ✅ Modal form opens with current values
   
   **Upload Photo:**
   - Click "Upload Photo" or "Change Photo"
   - Select an image (JPG/PNG/GIF, max 2MB)
   - ✅ Preview appears
   - ✅ Upload completes
   
   **Update Info:**
   - Change name, role, date of birth, bio
   - Click "Save Changes"
   - ✅ Profile updates
   - ✅ Modal closes
   - ✅ Card shows new info
   - ✅ Age calculated correctly

## Step 3: Functionality Testing (Browser Console)

### Test API - Get All Profiles

```javascript
const response = await fetch('/api/profiles');
const data = await response.json();
console.log('All profiles:', data.profiles);
```

**Expected:** Array of all family member profiles

### Test API - Update Profile

```javascript
const response = await fetch('/api/profiles/YOUR_USER_ID', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Name',
    role: 'father',
    date_of_birth: '1980-01-15',
    bio: 'Test bio'
  })
});
const data = await response.json();
console.log('Updated profile:', data.profile);
```

**Expected:** Updated profile object

### Test API - Upload Photo

```javascript
const formData = new FormData();
// Create a file input or use an existing file
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  formData.append('file', file);
  
  const response = await fetch('/api/profiles/YOUR_USER_ID/photo', {
    method: 'POST',
    body: formData
  });
  const data = await response.json();
  console.log('Upload result:', data);
};
fileInput.click();
```

**Expected:** Returns URL and path

## Step 4: Backend Testing

### Verify Database

```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('photo_url', 'date_of_birth', 'bio');

-- Check index exists
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND indexname = 'idx_profiles_date_of_birth';
```

### Verify Storage

1. Go to Supabase Dashboard → Storage
2. Check `memories` bucket
3. ✅ Photos stored in `profiles/{user_id}/` folders
4. ✅ Photos are publicly accessible

## Step 5: Edge Cases

1. **No Photo:** ✅ Initial letter displayed
2. **No Date of Birth:** ✅ Age not shown, no error
3. **Empty Name:** ✅ Email username used as fallback
4. **Large File:** ✅ Error for files > 2MB
5. **Invalid File:** ✅ Error for non-image files
6. **Edit Other User:** ✅ 403 Forbidden error

## Quick Checklist

- [ ] Migration applied successfully
- [ ] Home page shows "Meet the Family" section
- [ ] Family page displays all members
- [ ] Can upload profile photo
- [ ] Can edit profile information
- [ ] Age calculates correctly
- [ ] API endpoints work
- [ ] Authorization works (can't edit others)
- [ ] Storage integration works
- [ ] Responsive design works

## Troubleshooting

**Issue:** Photos not loading
- ✅ Check `memories` bucket is public
- ✅ Check `next.config.ts` has Supabase remote patterns
- ✅ Restart dev server after config changes

**Issue:** Can't update profile
- ✅ Check you're logged in
- ✅ Check you're updating your own profile (not others)

**Issue:** Age not showing
- ✅ Verify date_of_birth is set
- ✅ Check date format (YYYY-MM-DD)

---

For detailed testing instructions, see [FEATURES/FAMILY_PROFILES.md](./FEATURES/FAMILY_PROFILES.md)



