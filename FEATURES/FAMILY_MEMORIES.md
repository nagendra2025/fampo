# Family Memories Feature

**Status:** ✅ Complete  
**Feature #:** 6 of 6  
**Last Updated:** Current Session

---

## Overview

The Family Memories feature provides a timeline-based photo gallery for preserving and sharing special family moments. Users can upload photos with optional notes, view memories in a chronological timeline grouped by date, and manage their family's digital photo collection.

---

## Purpose

According to the PRD, this feature serves as:
- Preserve family moments with photos and notes
- Timeline view for chronological browsing
- Auto timestamp for all memories
- Storage in Supabase Storage for reliable photo hosting

---

## Features Implemented

### ✅ Core Functionality
- **Upload Photos** - Upload images (JPG, PNG, GIF) up to 5MB
- **Add Notes** - Optional text notes to accompany photos
- **Timeline View** - Memories grouped by date, newest first
- **Edit Memories** - Update notes for existing memories
- **Delete Memories** - Remove memories and associated photos from storage
- **Auto Timestamp** - Automatic creation timestamp for all memories
- **Photo Display** - High-quality image display with hover effects

### ✅ Photo Upload Features
- **File Validation** - Type and size validation (max 5MB)
- **Preview Before Upload** - See photo before creating memory
- **Progress Indication** - Upload status feedback
- **Error Handling** - Clear error messages for invalid files
- **Storage Integration** - Direct upload to Supabase Storage

### ✅ UI Features
- **Timeline Layout** - Date headers with memories grouped below
- **Grid Display** - Responsive grid (3→2→1 columns)
- **Photo Cards** - Square aspect ratio with hover effects
- **Edit/Delete Actions** - Hover to reveal action buttons
- **Empty State** - Friendly message when no memories exist
- **Modal Forms** - Clean form interface for create/edit

---

## File Structure

```
app/
├── memories/
│   ├── page.tsx                    # Server component - fetches memories
│   ├── memories-client.tsx         # Client component - timeline and logic
│   ├── memory-card.tsx             # Individual memory card component
│   └── memory-form.tsx             # Modal form for creating/editing
└── api/
    └── memories/
        ├── route.ts                # GET (list), POST (create)
        ├── upload/
        │   └── route.ts            # POST (upload photo to storage)
        └── [id]/
            └── route.ts            # PUT (update), DELETE (delete)
```

---

## API Endpoints

### GET /api/memories
**Description:** List all memories  
**Authentication:** Required  
**Authorization:** All authenticated users can view

**Response:**
```json
{
  "memories": [
    {
      "id": "uuid",
      "photo_url": "https://[project].supabase.co/storage/v1/object/public/memories/[path]",
      "note": "Family dinner at grandma's house",
      "created_by": "user-uuid",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

**Sorting:** Ordered by `created_at DESC` (newest first)

### POST /api/memories/upload
**Description:** Upload photo to Supabase Storage  
**Authentication:** Required  
**Authorization:** All authenticated users can upload

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with `file` field

**Response:**
```json
{
  "url": "https://[project].supabase.co/storage/v1/object/public/memories/[path]",
  "path": "user-id/timestamp-random.jpg"
}
```

**Error Responses:**
- `400` - No file provided, invalid file type, or file too large
- `401` - Unauthorized
- `500` - Upload error

**File Validation:**
- Must be an image (starts with "image/")
- Max size: 5MB
- Supported formats: JPG, PNG, GIF

### POST /api/memories
**Description:** Create a new memory  
**Authentication:** Required  
**Authorization:** All authenticated users can create

**Request Body:**
```json
{
  "photo_url": "https://[project].supabase.co/storage/v1/object/public/memories/[path]",
  "note": "Family dinner at grandma's house"
}
```

**Response:**
```json
{
  "memory": {
    "id": "uuid",
    "photo_url": "https://...",
    "note": "Family dinner at grandma's house",
    "created_by": "user-uuid",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Error Responses:**
- `400` - Photo URL is required
- `401` - Unauthorized
- `404` - Profile not found
- `500` - Server error

### PUT /api/memories/[id]
**Description:** Update memory note  
**Authentication:** Required  
**Authorization:** All authenticated users can update

**Request Body:**
```json
{
  "note": "Updated note text"
}
```

**Note:** Photo cannot be changed after creation. Only the note can be updated.

**Response:**
```json
{
  "memory": {
    "id": "uuid",
    "photo_url": "https://...",
    "note": "Updated note text",
    "created_by": "user-uuid",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Memory not found
- `500` - Server error

### DELETE /api/memories/[id]
**Description:** Delete memory and associated photo  
**Authentication:** Required  
**Authorization:** All authenticated users can delete

**Response:**
```json
{
  "success": true
}
```

**Behavior:**
- Deletes memory record from database
- Deletes photo file from Supabase Storage
- Both operations must succeed

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

## Database Schema

### Table: `memories`

```sql
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_url TEXT NOT NULL,
  note TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
- `idx_memories_created_at` - On `created_at DESC` for timeline sorting

### Row Level Security (RLS)

**View Policy:**
- All authenticated users can view all memories

**Create Policy:**
- All authenticated users can create memories

**Update Policy:**
- All authenticated users can update memories

**Delete Policy:**
- All authenticated users can delete memories

---

## Storage Configuration

### Supabase Storage Bucket: `memories`

**Configuration:**
- **Public:** `true` (required for Next.js Image component)
- **File Organization:** `{user-id}/{timestamp}-{random}.{ext}`
- **Max File Size:** 5MB (enforced in application)
- **Supported Formats:** JPG, PNG, GIF

### Storage Policies

**View Policy:**
- All authenticated users can view photos

**Upload Policy:**
- All authenticated users can upload photos

**Delete Policy:**
- All authenticated users can delete photos

### URL Format

Public URLs follow this pattern:
```
https://[project-id].supabase.co/storage/v1/object/public/memories/[user-id]/[timestamp]-[random].[ext]
```

---

## Dependencies

### Frontend Dependencies
- **Next.js 15** - Framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **date-fns** - Date formatting and grouping
- **next/image** - Optimized image component

### Backend Dependencies
- **Supabase** - Database and storage
- **@supabase/supabase-js** - Supabase client library
- **@supabase/ssr** - Server-side Supabase utilities

### Database Dependencies
- **PostgreSQL** (via Supabase)
- **Supabase Storage** - Photo storage
- **profiles table** - User reference

### Configuration Dependencies
- **next.config.ts** - Image domain configuration for Supabase Storage

---

## Next.js Image Configuration

### Required Configuration

The `next.config.ts` must include Supabase Storage domain:

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

This allows Next.js Image component to load images from Supabase Storage.

---

## Timeline Logic

### Date Grouping

Memories are grouped by creation date:

```typescript
// Group memories by date
const groupedMemories = memories.reduce((acc, memory) => {
  const date = parseISO(memory.created_at);
  const dateKey = format(date, "MMMM d, yyyy");
  
  if (!acc[dateKey]) {
    acc[dateKey] = [];
  }
  acc[dateKey].push(memory);
  return acc;
}, {} as Record<string, Memory[]>);
```

### Display Order

- **Date Headers:** Sorted newest first
- **Memories per Date:** Displayed in grid, newest first within each date
- **Timeline Flow:** Top to bottom, newest to oldest

### Date Format

- **Header Format:** "December 28, 2024"
- **Time Format:** "2:30 PM" (shown on each memory card)

---

## UI Components

### MemoryCard Component
**Location:** `app/memories/memory-card.tsx`

**Props:**
- `memory` - Memory object
- `onEdit` - Edit handler function
- `onDelete` - Delete handler function

**Features:**
- Square photo display (aspect-square)
- Photo zoom on hover
- Note display (if provided)
- Time display
- Edit/Delete buttons on hover
- Responsive sizing

### MemoryForm Component
**Location:** `app/memories/memory-form.tsx`

**Props:**
- `memory` - Memory object (null for create, populated for edit)
- `onSubmit` - Submit handler function
- `onClose` - Close handler function

**Features:**
- File upload with preview
- File validation (type, size)
- Upload progress indication
- Note textarea
- Edit mode (photo cannot be changed)
- Error handling

### MemoriesClient Component
**Location:** `app/memories/memories-client.tsx`

**Features:**
- State management for memories list
- Timeline grouping logic
- Form modal management
- CRUD operations
- Date sorting

---

## Photo Upload Flow

### Step-by-Step Process

1. **User selects file**
   - File input triggers `handleFileSelect`
   - File validation (type, size)

2. **Preview generation**
   - FileReader creates data URL preview
   - Preview displayed immediately

3. **Upload to storage**
   - FormData created with file
   - POST to `/api/memories/upload`
   - File uploaded to Supabase Storage

4. **Get public URL**
   - Server returns public URL
   - URL stored in component state

5. **Create memory**
   - User adds optional note
   - Submit creates memory record
   - Memory appears in timeline

### File Naming Convention

```
{user-id}/{timestamp}-{random}.{ext}
```

Example: `ca45fd2b-4a47-46d4-9d2b-e2de3d5a95a1/1766930673809-t9tgk.jpg`

- **User ID:** Ensures user-specific organization
- **Timestamp:** Ensures uniqueness and sorting
- **Random:** Additional uniqueness guarantee
- **Extension:** Preserves original file type

---

## User Experience

### Creating a Memory
1. Click "+ Add Memory" button
2. Click "Choose Photo" or drag and drop
3. Select image file (JPG, PNG, GIF, < 5MB)
4. Preview appears automatically
5. Optionally add a note
6. Click "Create Memory"
7. Memory appears in timeline

### Viewing Memories
1. Memories displayed in timeline
2. Grouped by date with headers
3. Grid layout (3 columns → 2 → 1)
4. Hover over card to see actions
5. Click photo to see full size (browser default)

### Editing a Memory
1. Hover over memory card
2. Click "Edit" button
3. Update note (photo cannot be changed)
4. Click "Update Memory"
5. Changes reflected immediately

### Deleting a Memory
1. Hover over memory card
2. Click "Delete" button
3. Confirm deletion
4. Memory and photo removed

---

## Testing Checklist

### Functional Testing
- [x] Upload photo with note
- [x] Upload photo without note
- [x] Edit memory note
- [x] Delete memory (and photo)
- [x] Timeline groups by date correctly
- [x] Newest memories appear first
- [x] Multiple memories on same date display correctly
- [x] File validation works (type, size)
- [x] Preview displays before upload
- [x] Photo displays correctly after upload

### UI Testing
- [x] Timeline date headers display correctly
- [x] Grid layout responsive (3→2→1 columns)
- [x] Photo cards display correctly
- [x] Hover effects work
- [x] Edit/Delete buttons appear on hover
- [x] Form modal opens and closes
- [x] Upload progress indication
- [x] Empty state shows when no memories
- [x] Error messages display correctly

### Backend Testing
- [x] GET endpoint returns all memories
- [x] POST upload endpoint works
- [x] POST create endpoint works
- [x] PUT update endpoint works
- [x] DELETE endpoint removes memory and photo
- [x] File validation works (type, size)
- [x] Authentication required for all endpoints
- [x] Error handling works (400, 401, 500)

### Storage Testing
- [x] Photos upload to Supabase Storage
- [x] Photos are accessible via public URL
- [x] Photos are organized by user ID
- [x] Photos are deleted when memory is deleted
- [x] File names are unique
- [x] Storage bucket is public

---

## Example Use Cases

### 1. Family Dinner Memory
```
Photo: family-dinner.jpg
Note: "Great dinner at grandma's house. Everyone was there!"
Date: Auto-timestamped
```

### 2. Weekend Trip
```
Photo: park-trip.jpg
Note: "Weekend trip to the park. Kids had a blast!"
Date: Auto-timestamped
```

### 3. Birthday Celebration
```
Photo: birthday-party.jpg
Note: "Son's 20th birthday celebration"
Date: Auto-timestamped
```

### 4. Simple Photo
```
Photo: sunset.jpg
Note: (empty)
Date: Auto-timestamped
```

---

## Security Considerations

1. **RLS Policies** - All database operations protected by Row Level Security
2. **API Authorization** - Server-side checks for authentication
3. **File Validation** - Type and size validation on both client and server
4. **Storage Policies** - RLS policies on storage bucket
5. **Public Bucket** - Bucket is public for image display, but RLS still controls upload/delete
6. **SQL Injection** - Protected by Supabase parameterized queries
7. **XSS Prevention** - React automatically escapes content

---

## Performance Considerations

1. **Image Optimization** - Next.js Image component optimizes images
2. **Lazy Loading** - Images load as needed
3. **Indexes** - Created_at index for fast sorting
4. **Client-Side Grouping** - Timeline grouping done in browser
5. **Grid Layout** - CSS Grid for efficient rendering
6. **File Size Limits** - 5MB max prevents large uploads
7. **Storage CDN** - Supabase Storage uses CDN for fast delivery

---

## Storage Setup Requirements

### Critical: Make Bucket Public

The storage bucket **must be public** for Next.js Image component to work:

**Option 1: SQL Migration**
```sql
UPDATE storage.buckets
SET public = true
WHERE id = 'memories';
```

**Option 2: Supabase Dashboard**
1. Go to Storage → memories bucket
2. Settings → Toggle "Public bucket" ON
3. Save

### Verify Configuration

1. **Bucket exists:** Storage → memories bucket visible
2. **Bucket is public:** Settings shows "Public bucket: ON"
3. **Policies active:** RLS policies allow authenticated access
4. **Next.js config:** `next.config.ts` includes Supabase domain

---

## Troubleshooting

### Issue: Photo not uploading
**Solution:**
- Check browser console for errors
- Verify Supabase Storage bucket exists
- Check Storage policies allow upload
- Verify file size < 5MB
- Verify file is an image type
- Check network tab for API response

### Issue: Photo not displaying
**Solution:**
- Verify `next.config.ts` includes Supabase domain
- Restart dev server after config changes
- Check `photo_url` in database is valid
- Verify URL is accessible (open in new tab)
- Check Storage bucket is public
- Verify CORS settings in Supabase

### Issue: Memory not appearing
**Solution:**
- Check browser console for errors
- Verify API call is successful (Network tab)
- Check `memories` table in database
- Verify RLS policies are active

### Issue: Delete not working
**Solution:**
- Check browser console for errors
- Verify API call is successful
- Check photo is deleted from storage
- Verify memory is deleted from database
- Check Storage delete policy

### Issue: Timeline not grouping correctly
**Solution:**
- Check date format in database
- Verify `created_at` timestamps are correct
- Check timezone settings
- Verify date-fns formatting

### Issue: "Failed to load image" error
**Solution:**
- Verify Storage bucket is public
- Check `next.config.ts` has Supabase domain
- Restart dev server
- Verify URL format is correct
- Check browser console for specific error

---

## Code References

### Key Files
- `app/memories/page.tsx` - Server component entry point
- `app/memories/memories-client.tsx` - Main client logic
- `app/memories/memory-form.tsx` - Upload and edit form
- `app/memories/memory-card.tsx` - Memory display card
- `app/api/memories/route.ts` - List and create endpoints
- `app/api/memories/upload/route.ts` - Photo upload endpoint
- `app/api/memories/[id]/route.ts` - Update and delete endpoints

### Key Functions
- `handleFileSelect()` - File selection and upload handler
- `handleCreateMemory()` - Create memory handler
- `handleUpdateMemory()` - Update memory handler
- `handleDeleteMemory()` - Delete memory handler
- `refreshMemories()` - Refresh memories list
- Timeline grouping logic in `memories-client.tsx`

### Key Queries
```sql
-- Get all memories, newest first
SELECT * FROM memories 
ORDER BY created_at DESC;

-- Group by date (application logic)
-- Done in JavaScript using date-fns
```

---

## API Testing Examples

### Browser Console Testing
```javascript
// GET all memories
fetch('/api/memories')
  .then(res => res.json())
  .then(console.log);

// POST upload photo
const formData = new FormData();
formData.append('file', fileInput.files[0]);
fetch('/api/memories/upload', {
  method: 'POST',
  body: formData
})
  .then(res => res.json())
  .then(console.log);

// POST create memory
fetch('/api/memories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    photo_url: 'https://...',
    note: 'Test memory'
  })
})
  .then(res => res.json())
  .then(console.log);

// PUT update memory
fetch('/api/memories/[id]', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ note: 'Updated note' })
})
  .then(res => res.json())
  .then(console.log);

// DELETE memory
fetch('/api/memories/[id]', {
  method: 'DELETE'
})
  .then(res => res.json())
  .then(console.log);
```

### Database Verification
```sql
-- Check all memories
SELECT * FROM memories ORDER BY created_at DESC;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'memories';

-- Verify bucket is public
SELECT id, name, public FROM storage.buckets WHERE id = 'memories';
```

### Storage Verification
1. Go to Supabase Dashboard → Storage → memories
2. Verify files are uploaded
3. Verify files are organized by user ID
4. Click on a file to verify it's accessible

---

## Configuration Files

### next.config.ts
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

### Storage Migration
See `supabase/migrations/002_storage_setup.sql` and `004_make_memories_bucket_public.sql`

---

## Future Enhancements (Not in Phase 1)

- Photo editing/cropping
- Multiple photos per memory
- Photo albums/collections
- Photo search functionality
- Photo tags/categories
- Photo sharing with external links
- Photo compression/optimization
- Video support
- Photo slideshow view
- Download photos
- Photo metadata (location, camera info)

---

## Related Features

- **Authentication** - Required for access
- **Profiles** - User reference
- **Navigation** - Links to Memories page
- **Home Dashboard** - Card linking to Memories
- **Supabase Storage** - Photo hosting

---

## Design Philosophy

### Timeline View
- Chronological organization
- Date-based grouping
- Visual separation between dates
- Easy to browse through time

### Photo-First Design
- Photos are the primary content
- Notes are secondary
- Square aspect ratio for consistency
- Hover effects for interactivity

### Simple and Clean
- Minimal UI elements
- Focus on content
- Easy to use for all ages
- No complex features

---

**Feature Status:** ✅ Complete and Tested  
**Documentation Version:** 1.0  
**Last Updated:** Current Session



