# Family Profiles Feature

**Version:** 1.0.0  
**Status:** ✅ Complete  
**Last Updated:** Current Session

## Overview

The Family Profiles feature allows family members to view and manage their profiles, including photos, names, roles, dates of birth, and bios. This feature enhances the family dashboard by providing a visual representation of all family members. It integrates seamlessly with the existing authentication system and uses the same storage bucket as the Memories feature for profile photos.

## Table of Contents

1. [Features](#features)
2. [Dependencies](#dependencies)
3. [Database Schema](#database-schema)
4. [Setup & Installation](#setup--installation)
5. [Configuration](#configuration)
6. [API Endpoints](#api-endpoints)
7. [Components](#components)
8. [Pages](#pages)
9. [Utilities](#utilities)
10. [Testing Guide](#testing-guide)
11. [File Structure](#file-structure)
12. [Security Considerations](#security-considerations)
13. [Integration Points](#integration-points)
14. [Troubleshooting](#troubleshooting)
15. [Future Enhancements](#future-enhancements)

## Features

1. **Profile Display**
   - View all family members with photos, names, roles, and ages
   - "Meet the Family" section on the home page
   - Dedicated Family page for full profile management

2. **Profile Management**
   - Edit your own profile (name, role, date of birth, bio)
   - Upload and change profile photos (max 2MB)
   - Automatic age calculation from date of birth

3. **Visual Design**
   - Color-coded role badges (Father, Mother, Son, Daughter, etc.)
   - Profile photo with fallback to initial letter
   - Responsive grid layout

## Database Schema

### Migration: `005_add_profile_fields.sql`

This migration extends the existing `profiles` table (created in `001_initial_schema.sql`) with additional fields for profile display and management.

#### New Columns Added

1. **`photo_url` (TEXT, NULLABLE)**
   - **Purpose**: Stores the public URL to the profile photo in Supabase Storage
   - **Format**: Full HTTPS URL (e.g., `https://[project].supabase.co/storage/v1/object/public/memories/profiles/[user_id]/[filename]`)
   - **Default**: `NULL` (no photo uploaded)
   - **Updates**: Set automatically when photo is uploaded via API

2. **`date_of_birth` (DATE, NULLABLE)**
   - **Purpose**: Stores the user's date of birth for age calculation
   - **Format**: ISO date format (YYYY-MM-DD)
   - **Default**: `NULL` (optional field)
   - **Validation**: Should be in the past (enforced in UI with `max` attribute)

3. **`bio` (TEXT, NULLABLE)**
   - **Purpose**: Stores an optional biography or description
   - **Format**: Plain text, no length limit (but UI suggests keeping it short)
   - **Default**: `NULL` (optional field)

#### Index Created

- **`idx_profiles_date_of_birth`**: Index on `date_of_birth` column for efficient age calculations and sorting

#### Migration SQL

```sql
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
```

#### Existing `profiles` Table Structure

The `profiles` table already contains (from `001_initial_schema.sql`):
- `id` (UUID, PRIMARY KEY) - References `auth.users(id)`
- `name` (TEXT, NULLABLE) - User's display name
- `email` (TEXT, NOT NULL) - User's email address
- `role` (TEXT, NULLABLE) - User's role (father, mother, son, daughter, parent, child)
- `created_at` (TIMESTAMPTZ) - Account creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp (auto-updated via trigger)

## API Endpoints

### GET `/api/profiles`

Fetches all family member profiles.

**Response:**
```json
{
  "profiles": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "father",
      "photo_url": "https://...",
      "date_of_birth": "1980-01-15",
      "bio": "Father of the family",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### PUT `/api/profiles/[id]`

Updates a profile. Users can only update their own profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "role": "father",
  "date_of_birth": "1980-01-15",
  "bio": "Father of the family",
  "photo_url": "https://..."
}
```

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "name": "John Doe",
    ...
  }
}
```

### POST `/api/profiles/[id]/photo`

Uploads a profile photo. Users can only upload their own photo.

**Request:** FormData with `file` field

**Response:**
```json
{
  "url": "https://...",
  "path": "profiles/uuid/timestamp-random.ext"
}
```

## Components

### `FamilySection` (`components/family-section.tsx`)

Displays the "Meet the Family" section on the home page.

**Props:**
- `profiles`: Array of profile objects
- `currentUserId`: ID of the currently logged-in user

### `FamilyMemberCard` (`components/family-member-card.tsx`)

Displays a single family member's card with photo, name, role, and age.

**Props:**
- `profile`: Profile object
- `isOwnProfile`: Boolean indicating if this is the current user's profile
- `onEdit`: Callback function for edit button click

### `FamilyPageClient` (`app/family/family-page-client.tsx`)

Client component for the Family page that manages profile editing state.

### `ProfileEditForm` (`app/family/profile-edit-form.tsx`)

Modal form for editing profile information, including photo upload.

## Pages

### `/home`

Home page now includes the "Meet the Family" section at the bottom, displaying all family members in a grid layout.

### `/family`

Dedicated Family page for viewing and managing all family member profiles. Users can click "Edit Profile" on their own card to update their information.

## Utilities

### `lib/utils/age.ts`

- `calculateAge(dateOfBirth: string)`: Calculates age from date of birth
- `formatDateOfBirth(dateOfBirth: string)`: Formats date of birth for display

## Setup & Installation

### Prerequisites

1. **Existing Setup**: This feature requires the base Rasna application to be set up:
   - Supabase project created and configured
   - Database migrations `001_initial_schema.sql` and `002_storage_setup.sql` applied
   - Environment variables configured (`.env.local`)
   - Application dependencies installed (`npm install`)

2. **Storage Bucket**: The `memories` storage bucket must exist and be public:
   - Created by `002_storage_setup.sql`
   - Made public by `004_make_memories_bucket_public.sql` (if not already public)

### Step 1: Apply Database Migration

1. **Open Supabase Dashboard**
   - Navigate to your Supabase project
   - Go to SQL Editor

2. **Run Migration**
   - Open `supabase/migrations/005_add_profile_fields.sql`
   - Copy the entire SQL content
   - Paste into SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for success confirmation

3. **Verify Migration**
   ```sql
   -- Run this in SQL Editor to verify
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'profiles'
   AND column_name IN ('photo_url', 'date_of_birth', 'bio')
   ORDER BY column_name;
   ```
   Expected result: 3 rows showing the new columns

4. **Verify Index**
   ```sql
   -- Check index was created
   SELECT indexname, indexdef
   FROM pg_indexes
   WHERE tablename = 'profiles'
   AND indexname = 'idx_profiles_date_of_birth';
   ```

### Step 2: Verify Configuration

1. **Check `next.config.ts`**
   - Ensure Supabase image remote patterns are configured:
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: "https",
         hostname: "*.supabase.co",
         pathname: "/storage/v1/object/public/**",
       },
     ],
   }
   ```
   - This should already be configured from the Memories feature

2. **Verify Storage Bucket**
   - Go to Supabase Dashboard → Storage
   - Confirm `memories` bucket exists
   - Confirm bucket is **public** (required for image display)
   - If not public, run:
     ```sql
     UPDATE storage.buckets SET public = true WHERE id = 'memories';
     ```

### Step 3: Restart Development Server

After applying the migration, restart your Next.js dev server:

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 4: Verify Installation

1. **Navigate to Home Page**
   - Login to the application
   - Go to `/home`
   - Scroll down - you should see "Meet the Family" section

2. **Check Navigation**
   - "Family" link should appear in the navigation bar

3. **Test Profile Page**
   - Click "Family" in navigation or go to `/family`
   - Should see all family member profiles

## Configuration

### Environment Variables

No additional environment variables are required. Uses existing Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Next.js Configuration

The feature uses the existing image configuration in `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*.supabase.co",
      pathname: "/storage/v1/object/public/**",
    },
  ],
}
```

This allows Next.js Image component to load photos from Supabase Storage.

### Storage Configuration

Profile photos are stored in the existing `memories` bucket:
- **Bucket Name**: `memories`
- **Path Pattern**: `profiles/{user_id}/{timestamp}-{random}.{ext}`
- **Access**: Public (for display)
- **Max File Size**: 2MB (enforced in API)
- **Allowed Types**: image/jpeg, image/png, image/gif

## Testing Guide

### Prerequisites

1. Database migration applied (see [Setup & Installation](#setup--installation))
2. Application running: `npm run dev`
3. At least one user account created and logged in

### UI Testing

#### 1. Home Page - Meet the Family Section

1. **Navigate to Home Page**
   - Login to the application
   - Go to `/home`
   - Scroll down past the feature cards

2. **Verify Family Section Display**
   - ✅ "Meet the Family" heading is visible
   - ✅ All family members are displayed in a grid
   - ✅ Each member shows:
     - Profile photo (or initial letter if no photo)
     - Name
     - Role badge with color coding
     - Age (if date of birth is set)
   - ✅ Your own profile has a ring border
   - ✅ "View Full Family →" button is visible

3. **Test Responsive Layout**
   - ✅ Grid adjusts on different screen sizes
   - ✅ Cards are properly spaced

#### 2. Family Page

1. **Navigate to Family Page**
   - Click "View Full Family →" button on home page
   - OR click "Family" in the navigation bar
   - OR go directly to `/family`

2. **Verify Page Display**
   - ✅ "Our Family" heading is visible
   - ✅ All family members displayed in a grid
   - ✅ Each card shows complete information
   - ✅ "Edit Profile" button visible on your own card only

3. **Test Profile Editing**

   a. **Open Edit Form**
      - Click "Edit Profile" on your own card
      - ✅ Modal form opens
      - ✅ All current values are pre-filled

   b. **Upload Profile Photo**
      - Click "Upload Photo" or "Change Photo"
      - Select an image file (JPG, PNG, or GIF)
      - ✅ File size validation (max 2MB)
      - ✅ Image preview appears
      - ✅ Upload completes successfully
      - ✅ Photo URL updates in profile

   c. **Update Profile Information**
      - Change name
      - Change role (Father, Mother, Son, Daughter, Parent, Child)
      - Set date of birth
      - Add bio
      - Click "Save Changes"
      - ✅ Profile updates successfully
      - ✅ Modal closes
      - ✅ Card reflects new information
      - ✅ Age is calculated and displayed correctly

   d. **Test Validation**
      - Try uploading a file > 2MB → ✅ Error message
      - Try uploading a non-image file → ✅ Error message
      - Leave name empty → ✅ Should work (uses email)

   e. **Test Cancel**
      - Make changes
      - Click "Cancel"
      - ✅ Modal closes without saving
      - ✅ Original values remain

#### 3. Navigation

1. **Verify Navigation Link**
   - ✅ "Family" link appears in navigation bar
   - ✅ Clicking it navigates to `/family`

### Functionality Testing

#### 1. Profile Photo Upload

1. **Upload New Photo**
   ```javascript
   // In browser console
   const formData = new FormData();
   const file = // select a file input
   formData.append('file', file);
   
   const response = await fetch('/api/profiles/YOUR_USER_ID/photo', {
     method: 'POST',
     body: formData
   });
   const data = await response.json();
   console.log(data);
   ```
   - ✅ Returns URL and path
   - ✅ Photo is accessible via URL
   - ✅ Old photo is deleted (if exists)

2. **Verify Photo Storage**
   - Check Supabase Storage → `memories` bucket
   - ✅ Photo is stored in `profiles/{user_id}/` folder
   - ✅ Photo is publicly accessible

#### 2. Profile Update

1. **Update Profile via API**
   ```javascript
   // In browser console
   const response = await fetch('/api/profiles/YOUR_USER_ID', {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       name: 'Updated Name',
       role: 'father',
       date_of_birth: '1980-01-15',
       bio: 'Updated bio'
     })
   });
   const data = await response.json();
   console.log(data);
   ```
   - ✅ Profile updates successfully
   - ✅ Returns updated profile object

2. **Test Authorization**
   - Try updating another user's profile
   - ✅ Returns 403 Forbidden error

#### 3. Fetch All Profiles

1. **Get All Profiles**
   ```javascript
   // In browser console
   const response = await fetch('/api/profiles');
   const data = await response.json();
   console.log(data.profiles);
   ```
   - ✅ Returns array of all profiles
   - ✅ Profiles are ordered by role, then created_at
   - ✅ All fields are included

### Backend Testing

#### 1. Database Migration

1. **Verify Migration Applied**
   ```sql
   -- In Supabase SQL Editor
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' 
   AND column_name IN ('photo_url', 'date_of_birth', 'bio');
   ```
   - ✅ All three columns exist
   - ✅ Data types are correct (TEXT, DATE, TEXT)

2. **Test Index**
   ```sql
   -- In Supabase SQL Editor
   SELECT indexname 
   FROM pg_indexes 
   WHERE tablename = 'profiles' 
   AND indexname = 'idx_profiles_date_of_birth';
   ```
   - ✅ Index exists

#### 2. API Endpoints

1. **GET `/api/profiles`**
   ```bash
   # Using curl (requires session cookie)
   curl -X GET http://localhost:3000/api/profiles \
     -H "Cookie: your-session-cookie"
   ```
   - ✅ Returns 200 OK
   - ✅ Returns all profiles
   - ✅ Unauthorized request returns 401

2. **PUT `/api/profiles/[id]`**
   ```bash
   curl -X PUT http://localhost:3000/api/profiles/YOUR_USER_ID \
     -H "Content-Type: application/json" \
     -H "Cookie: your-session-cookie" \
     -d '{
       "name": "Test Name",
       "role": "father",
       "date_of_birth": "1980-01-15",
       "bio": "Test bio"
     }'
   ```
   - ✅ Returns 200 OK
   - ✅ Profile is updated in database
   - ✅ Returns updated profile
   - ✅ Updating another user's profile returns 403

3. **POST `/api/profiles/[id]/photo`**
   ```bash
   curl -X POST http://localhost:3000/api/profiles/YOUR_USER_ID/photo \
     -H "Cookie: your-session-cookie" \
     -F "file=@/path/to/image.jpg"
   ```
   - ✅ Returns 200 OK
   - ✅ Photo is uploaded to storage
   - ✅ Profile photo_url is updated
   - ✅ Old photo is deleted (if exists)
   - ✅ Invalid file type returns 400
   - ✅ File too large returns 400

#### 3. Storage

1. **Verify Storage Bucket**
   - Check Supabase Dashboard → Storage
   - ✅ `memories` bucket exists
   - ✅ Bucket is public
   - ✅ Photos are stored in `profiles/{user_id}/` folders

2. **Test RLS Policies**
   - ✅ Users can upload their own photos
   - ✅ Users cannot upload photos for other users
   - ✅ Photos are publicly accessible (for display)

### Edge Cases

1. **No Profile Photo**
   - ✅ Initial letter is displayed
   - ✅ Gradient background is shown

2. **No Date of Birth**
   - ✅ Age is not displayed
   - ✅ No error occurs

3. **Empty Name**
   - ✅ Email username is used as fallback

4. **Invalid Date of Birth**
   - ✅ Future dates are prevented (max attribute)
   - ✅ Invalid dates are handled gracefully

5. **Multiple Users**
   - ✅ All users see all profiles
   - ✅ Each user can only edit their own profile
   - ✅ Profile updates are reflected immediately

## Dependencies

### Runtime Dependencies

This feature uses the following dependencies (already installed in the project):

1. **Next.js 16.1.1**
   - **Usage**: Framework for pages, API routes, and Image component
   - **Required For**: 
     - Server and client components
     - API route handlers (`/api/profiles/*`)
     - Next.js Image component for optimized photo display
   - **Location**: `package.json`

2. **React 19.2.3 & React DOM 19.2.3**
   - **Usage**: UI components and client-side interactivity
   - **Required For**: All client components (FamilySection, FamilyMemberCard, ProfileEditForm)
   - **Location**: `package.json`

3. **@supabase/supabase-js 2.89.0**
   - **Usage**: Supabase client for database and storage operations
   - **Required For**: 
     - Fetching profiles from database
     - Uploading photos to Supabase Storage
     - Updating profile records
   - **Location**: `package.json`

4. **@supabase/ssr 0.8.0**
   - **Usage**: Server-side rendering support for Supabase
   - **Required For**: Server components and API routes with proper session management
   - **Location**: `package.json`

5. **Tailwind CSS 4.x**
   - **Usage**: Styling for all UI components
   - **Required For**: Responsive design, color-coded role badges, card layouts
   - **Location**: `package.json` (devDependencies)

### Optional Dependencies

- **date-fns 4.1.0** (Already installed, but not required for this feature)
  - **Note**: This feature uses native JavaScript Date methods for age calculation
  - **Available**: If you want to use date-fns for future date formatting enhancements

### External Services

1. **Supabase PostgreSQL Database**
   - **Required**: `profiles` table with new columns
   - **Migration**: `005_add_profile_fields.sql`

2. **Supabase Storage**
   - **Bucket**: `memories` (shared with Memories feature)
   - **Path**: `profiles/{user_id}/` for profile photos
   - **Access**: Public bucket (for image display)
   - **Setup**: Already configured in `002_storage_setup.sql`

### Development Dependencies

- **TypeScript 5.x**: Type safety for all components
- **ESLint**: Code quality checks
- **@types/node, @types/react**: Type definitions

## File Structure

### New Files Created

#### Database
- **`supabase/migrations/005_add_profile_fields.sql`**
  - Database migration adding profile fields
  - Adds `photo_url`, `date_of_birth`, `bio` columns
  - Creates index on `date_of_birth`

#### API Routes
- **`app/api/profiles/route.ts`**
  - GET handler for fetching all family profiles
  - Returns profiles ordered by role and creation date

- **`app/api/profiles/[id]/route.ts`**
  - PUT handler for updating a profile
  - Authorization: Users can only update their own profile

- **`app/api/profiles/[id]/photo/route.ts`**
  - POST handler for uploading profile photos
  - Validates file type and size
  - Deletes old photo if exists
  - Updates profile with new photo URL

#### Components
- **`components/family-section.tsx`**
  - Client component for "Meet the Family" section on home page
  - Displays grid of family member cards
  - Includes "View Full Family" link

- **`components/family-member-card.tsx`**
  - Reusable card component for displaying a single family member
  - Shows photo, name, role badge, age
  - Handles photo fallback (initial letter)
  - Displays edit button for own profile

#### Pages
- **`app/family/page.tsx`**
  - Server component for Family page
  - Fetches all profiles from database
  - Passes data to client component

- **`app/family/family-page-client.tsx`**
  - Client component managing Family page state
  - Handles profile editing modal
  - Refreshes profiles after updates

- **`app/family/profile-edit-form.tsx`**
  - Modal form for editing profile
  - Handles photo upload
  - Form validation
  - Updates profile via API

#### Utilities
- **`lib/utils/age.ts`**
  - `calculateAge(dateOfBirth: string)`: Calculates age from date of birth
  - `formatDateOfBirth(dateOfBirth: string)`: Formats date for display
  - Uses native JavaScript Date methods (no external dependencies)

#### Documentation
- **`FEATURES/FAMILY_PROFILES.md`** (this file)
  - Complete feature documentation

- **`TESTING_FAMILY_PROFILES.md`**
  - Quick testing guide and checklist

### Modified Files

#### Pages
- **`app/home/page.tsx`**
  - Added import for `FamilySection` component
  - Added profile fetching query
  - Added `<FamilySection>` component at bottom of page

#### Components
- **`components/navigation.tsx`**
  - Added "Family" navigation item to `navItems` array
  - Includes family emoji icon (👨‍👩‍👧‍👦)

### Updated Documentation Files

- **`IMPLEMENTATION_STATUS.md`**
  - Added Family Profiles to completed features
  - Updated file counts and statistics

- **`FEATURES/README.md`**
  - Added Family Profiles to feature documentation index

### File Count Summary

- **New Files**: 10 files
- **Modified Files**: 2 files
- **Total**: 12 files changed/created

## Security Considerations

### Authorization

1. **Profile Updates**
   - Users can only update their own profiles
   - API route checks: `user.id !== id` returns 403 Forbidden
   - No parent/child override (future enhancement)

2. **Photo Uploads**
   - Users can only upload photos for their own profile
   - Same authorization check as profile updates

3. **Profile Viewing**
   - All authenticated users can view all profiles
   - This is intentional for family visibility
   - RLS policies allow SELECT for all authenticated users

### File Validation

1. **File Type**
   - Only image files accepted: `image/jpeg`, `image/png`, `image/gif`
   - Validated in API route before upload
   - Returns 400 Bad Request for invalid types

2. **File Size**
   - Maximum 2MB per photo
   - Validated in API route
   - Returns 400 Bad Request for oversized files

3. **File Naming**
   - Unique filenames generated: `{timestamp}-{random}.{ext}`
   - Prevents filename conflicts
   - Organized by user ID: `profiles/{user_id}/`

### Storage Security

1. **Bucket Access**
   - Uses existing `memories` bucket (shared with Memories feature)
   - Bucket is public for image display
   - Photos organized by user ID for logical separation

2. **Old Photo Cleanup**
   - When uploading new photo, old photo is automatically deleted
   - Prevents storage bloat
   - Uses Supabase Storage `remove()` method

### Database Security

1. **Row Level Security (RLS)**
   - RLS enabled on `profiles` table (from initial schema)
   - Policies allow all authenticated users to SELECT
   - Policies allow users to UPDATE their own profile only

2. **Input Validation**
   - Date of birth validated in UI (max = today)
   - Name, bio are sanitized (trimmed)
   - Role validated against allowed values

### Data Privacy

1. **Profile Information**
   - All profile data visible to all family members
   - No private/hidden fields
   - Email addresses visible (from existing schema)

2. **Photo Privacy**
   - Photos stored in public bucket
   - URLs are predictable but require knowledge of user ID
   - Consider private bucket with signed URLs for future enhancement

## Integration Points

### With Existing Features

1. **Authentication System**
   - Uses existing `profiles` table (extends it)
   - Leverages existing profile auto-creation trigger
   - Uses same Supabase client setup

2. **Memories Feature**
   - Shares `memories` storage bucket
   - Uses same image configuration in `next.config.ts`
   - Similar photo upload pattern

3. **Navigation System**
   - Integrated into main navigation bar
   - Consistent with other feature links

4. **Home Dashboard**
   - "Meet the Family" section added to home page
   - Appears after feature cards
   - Maintains consistent styling

### Data Flow

1. **Profile Creation**
   - New user signs up → Profile auto-created (existing trigger)
   - Profile has `photo_url`, `date_of_birth`, `bio` as NULL
   - User can fill in details via Family page

2. **Profile Display**
   - Home page fetches all profiles on server
   - Family page fetches all profiles on server
   - Client components handle interactivity

3. **Profile Updates**
   - User edits profile → API validates → Database updates
   - Client refreshes profile list
   - UI updates immediately

4. **Photo Upload**
   - User selects file → API validates → Uploads to Storage
   - Old photo deleted → Profile updated with new URL
   - Image component loads from public URL

## Troubleshooting

### Common Issues

#### 1. Photos Not Loading

**Symptoms**: Profile photos show broken image or don't display

**Solutions**:
- ✅ Verify `memories` bucket is public:
  ```sql
  UPDATE storage.buckets SET public = true WHERE id = 'memories';
  ```
- ✅ Check `next.config.ts` has Supabase remote patterns
- ✅ Restart dev server after config changes
- ✅ Verify photo URL in database is correct
- ✅ Check browser console for CORS or image loading errors

#### 2. Migration Fails

**Symptoms**: Error when running migration SQL

**Solutions**:
- ✅ Check if columns already exist (migration uses `IF NOT EXISTS`)
- ✅ Verify you have proper database permissions
- ✅ Check for syntax errors in SQL
- ✅ Ensure `profiles` table exists (from initial schema)

#### 3. Can't Update Profile

**Symptoms**: 403 Forbidden when trying to update

**Solutions**:
- ✅ Verify you're logged in
- ✅ Check you're updating your own profile (not another user's)
- ✅ Verify session is valid (try logging out and back in)
- ✅ Check browser console for error details

#### 4. Photo Upload Fails

**Symptoms**: Error when uploading photo

**Solutions**:
- ✅ Check file size (must be < 2MB)
- ✅ Verify file is an image (JPG, PNG, GIF)
- ✅ Check `memories` bucket exists and is accessible
- ✅ Verify storage policies allow uploads
- ✅ Check browser console for detailed error

#### 5. Age Not Displaying

**Symptoms**: Age doesn't show even after setting date of birth

**Solutions**:
- ✅ Verify `date_of_birth` is set in database
- ✅ Check date format (should be YYYY-MM-DD)
- ✅ Verify date is in the past
- ✅ Check browser console for calculation errors
- ✅ Refresh page after updating profile

#### 6. Family Section Not Showing

**Symptoms**: "Meet the Family" section doesn't appear on home page

**Solutions**:
- ✅ Verify migration was applied
- ✅ Check that profiles exist in database
- ✅ Verify user is logged in
- ✅ Check browser console for errors
- ✅ Restart dev server

### Debugging Tips

1. **Check Database**
   ```sql
   -- Verify columns exist
   SELECT * FROM profiles LIMIT 1;
   
   -- Check for profile data
   SELECT id, name, photo_url, date_of_birth, bio FROM profiles;
   ```

2. **Check Storage**
   - Go to Supabase Dashboard → Storage → memories bucket
   - Verify `profiles/` folder exists
   - Check individual user folders

3. **Check API Responses**
   ```javascript
   // In browser console
   const response = await fetch('/api/profiles');
   const data = await response.json();
   console.log(data);
   ```

4. **Check Network Tab**
   - Open browser DevTools → Network tab
   - Look for failed requests
   - Check response status codes and error messages

## Future Enhancements

### Planned Features

1. **Parent-Child Profile Management**
   - Allow parents to edit children's profiles
   - Add parent-child relationship mapping
   - Role-based editing permissions

2. **Photo Management**
   - Add photo cropping/editing before upload
   - Support for multiple photos per profile
   - Photo gallery view

3. **Profile Completion**
   - Show profile completion percentage
   - Encourage users to fill in missing information
   - Profile completion badges

4. **Enhanced Display**
   - Family tree visualization
   - Relationship indicators
   - Birthday reminders based on date of birth

5. **Privacy Options**
   - Option to make profile private
   - Control visibility of specific fields
   - Private bucket with signed URLs for photos

6. **Activity Metrics**
   - Profile activity/engagement tracking
   - Last updated timestamps
   - Profile view counts

### Technical Improvements

1. **Image Optimization**
   - Automatic image resizing/compression
   - WebP format support
   - Lazy loading for better performance

2. **Caching**
   - Cache profile data on client
   - Optimistic updates for better UX
   - Background refresh

3. **Validation**
   - More robust date validation
   - Bio character limits
   - Name format validation

---

**Documentation Version**: 1.0.0  
**Last Updated**: Current Session  
**Maintained By**: Development Team

