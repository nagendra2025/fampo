# Family Notes & Important Info Feature

**Status:** ✅ Complete  
**Feature #:** 4 of 6  
**Last Updated:** Current Session

---

## Overview

The Family Notes feature provides a permanent family reference space for storing important information that everyone needs to know. It supports different categories of notes and implements role-based access control where parents can create/edit/delete notes, while kids have read-only access (with optional read-only enforcement).

---

## Purpose

According to the PRD, this feature serves as:
- A permanent family reference space
- Centralized storage for important information
- Examples: Wi-Fi password, doctor contact info, school instructions, travel details

---

## Features Implemented

### ✅ Core Functionality
- **Create Notes** - Parents can create notes with title, content, category, and read-only setting
- **View Notes** - All authenticated family members can view all notes
- **Edit Notes** - Only parents can edit notes
- **Delete Notes** - Only parents can delete notes
- **Category Filtering** - Filter notes by category (Emergency, Health, School, General)
- **Read-Only for Kids** - Optional setting to make notes read-only for kids
- **Role-Based Access** - Automatic permission checking based on user role

### ✅ Categories
- **Emergency** - Critical emergency information (red badge)
- **Health** - Health-related information (pink badge)
- **School** - School-related information (blue badge)
- **General** - General family information (gray badge)

### ✅ UI Features
- Grid layout (responsive: 3 columns → 2 → 1)
- Category badges with color coding
- Colored borders matching categories
- Multi-line content support (preserves formatting)
- Read-only indicator for kids
- Parent/kid view differentiation
- Empty state messaging
- Filter dropdown

---

## File Structure

```
app/
├── notes/
│   ├── page.tsx              # Server component - fetches notes and checks user role
│   ├── notes-client.tsx      # Client component - main notes list and filtering
│   ├── note-card.tsx         # Individual note card component
│   └── note-form.tsx         # Modal form for creating/editing notes
└── api/
    └── notes/
        ├── route.ts          # GET (list), POST (create)
        └── [id]/
            └── route.ts      # PUT (update), DELETE (delete)
```

---

## API Endpoints

### GET /api/notes
**Description:** List all notes  
**Authentication:** Required  
**Authorization:** All authenticated users can view

**Response:**
```json
{
  "notes": [
    {
      "id": "uuid",
      "title": "Wi-Fi Password",
      "content": "Network: RasnaFamily\nPassword: Family2024!",
      "category": "general",
      "is_readonly_for_kids": false,
      "created_by": "user-uuid",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/notes
**Description:** Create a new note  
**Authentication:** Required  
**Authorization:** Only parents can create

**Request Body:**
```json
{
  "title": "Wi-Fi Password",
  "content": "Network: RasnaFamily\nPassword: Family2024!",
  "category": "general",
  "is_readonly_for_kids": false
}
```

**Response:**
```json
{
  "note": {
    "id": "uuid",
    "title": "Wi-Fi Password",
    "content": "Network: RasnaFamily\nPassword: Family2024!",
    "category": "general",
    "is_readonly_for_kids": false,
    "created_by": "user-uuid",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Unauthorized
- `403` - Only parents can create notes
- `404` - Profile not found
- `500` - Server error

### PUT /api/notes/[id]
**Description:** Update an existing note  
**Authentication:** Required  
**Authorization:** Only parents can edit

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "category": "emergency",
  "is_readonly_for_kids": true
}
```

**Response:**
```json
{
  "note": {
    "id": "uuid",
    "title": "Updated Title",
    "content": "Updated content",
    "category": "emergency",
    "is_readonly_for_kids": true,
    "created_by": "user-uuid",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Unauthorized
- `403` - Only parents can edit notes / Note is read-only for kids
- `404` - Note not found
- `500` - Server error

### DELETE /api/notes/[id]
**Description:** Delete a note  
**Authentication:** Required  
**Authorization:** Only parents can delete

**Response:**
```json
{
  "success": true
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Only parents can delete notes
- `500` - Server error

---

## Database Schema

### Table: `notes`

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('emergency', 'health', 'school', 'general')) DEFAULT 'general',
  is_readonly_for_kids BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
- `idx_notes_category` - On `category` column for filtering performance

### Row Level Security (RLS)

**View Policy:**
- All authenticated users can view all notes

**Create Policy:**
- Only parents (father, mother, parent roles) can create notes

**Update Policy:**
- Only parents can update notes
- Additional check: If `is_readonly_for_kids` is true, only parents can edit

**Delete Policy:**
- Only parents can delete notes

---

## Dependencies

### Frontend Dependencies
- **Next.js 15** - Framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling

### Backend Dependencies
- **Supabase** - Database and authentication
- **@supabase/supabase-js** - Supabase client library
- **@supabase/ssr** - Server-side Supabase utilities

### Database Dependencies
- **PostgreSQL** (via Supabase)
- **profiles table** - For role-based access control

---

## Role-Based Access Control

### Parent Roles
Users with these roles can create, edit, and delete notes:
- `'father'`
- `'mother'`
- `'parent'`

### Kid Roles
Users with these roles can only view notes:
- `'son'`
- `'daughter'`
- `'child'`

### Permission Logic

```typescript
// Check if user is parent
const isParent = ["father", "mother", "parent"].includes(profile.role);

// API checks
if (!isParent) {
  return NextResponse.json(
    { error: "Only parents can create/edit/delete notes" },
    { status: 403 }
  );
}
```

---

## UI Components

### NoteCard Component
**Location:** `app/notes/note-card.tsx`

**Props:**
- `note` - Note object
- `isParent` - Boolean indicating if user is parent
- `onEdit` - Edit handler function
- `onDelete` - Delete handler function

**Features:**
- Category badge with color coding
- Read-only indicator
- Conditional Edit/Delete buttons (parent only)
- Multi-line content display

### NoteForm Component
**Location:** `app/notes/note-form.tsx`

**Props:**
- `note` - Note object (null for create, populated for edit)
- `onSubmit` - Submit handler function
- `onClose` - Close handler function

**Fields:**
- Title (required)
- Category (required) - Dropdown
- Content (required) - Textarea
- Read-only for kids (checkbox)

### NotesClient Component
**Location:** `app/notes/notes-client.tsx`

**Features:**
- State management for notes list
- Category filtering
- Form modal management
- CRUD operations
- Parent/kid view differentiation

---

## Category System

### Category Definitions

| Category | Color | Use Case |
|----------|-------|----------|
| Emergency | Red | Critical emergency contacts, procedures |
| Health | Pink | Doctor info, medical records, health notes |
| School | Blue | School contacts, instructions, schedules |
| General | Gray | Wi-Fi passwords, general family info |

### Category Colors (Tailwind Classes)

```typescript
const categoryColors = {
  emergency: "bg-red-100 text-red-800 border-red-300",
  health: "bg-pink-100 text-pink-800 border-pink-300",
  school: "bg-blue-100 text-blue-800 border-blue-300",
  general: "bg-gray-100 text-gray-800 border-gray-300",
};
```

---

## User Experience

### Parent View
1. See all notes in grid layout
2. Filter by category
3. Click "+ Add Note" to create
4. Click "Edit" on any note card to modify
5. Click "Delete" to remove notes
6. Toggle "Read-only for kids" when creating/editing

### Kid View
1. See all notes in grid layout
2. Filter by category
3. Info message: "📖 You can view all notes, but only parents can create or edit them."
4. No "+ Add Note" button
5. Notes show "View only - Parents can edit" message
6. No Edit/Delete buttons

---

## Testing Checklist

### Functional Testing
- [x] Create note as parent
- [x] Edit note as parent
- [x] Delete note as parent
- [x] View notes as kid
- [x] Attempt to create note as kid (should fail)
- [x] Attempt to edit note as kid (should fail)
- [x] Attempt to delete note as kid (should fail)
- [x] Filter by category works
- [x] Read-only for kids checkbox works
- [x] Multi-line content preserves formatting

### UI Testing
- [x] Category badges display correctly
- [x] Colored borders match categories
- [x] Grid layout responsive (3→2→1 columns)
- [x] Form modal displays correctly
- [x] Empty state shows when no notes
- [x] Info message shows for kids
- [x] Read-only indicator visible

### Edge Cases
- [x] Empty title/content validation
- [x] Category selection required
- [x] Long content displays correctly
- [x] Special characters in content
- [x] Multiple notes with same category

---

## Example Use Cases

### 1. Wi-Fi Password
```
Title: Wi-Fi Password
Category: General
Content:
Network: RasnaFamily
Password: Family2024!
Read-only for kids: Unchecked
```

### 2. Emergency Contacts
```
Title: Emergency Contact Numbers
Category: Emergency
Content:
Fire Department: 911
Police: 911
Family Doctor: (555) 123-4567
Read-only for kids: Checked
```

### 3. Doctor Information
```
Title: Doctor Contact Information
Category: Health
Content:
Dr. Smith
Phone: (555) 234-5678
Address: 123 Medical Center
Read-only for kids: Unchecked
```

### 4. School Instructions
```
Title: School Pickup Instructions
Category: School
Content:
Son: Pick up at 3:30 PM from main gate
Daughter: Pick up at 4:00 PM from side entrance
Read-only for kids: Checked
```

---

## Security Considerations

1. **RLS Policies** - All database operations protected by Row Level Security
2. **API Authorization** - Server-side checks for parent role
3. **Client-Side Hiding** - UI elements hidden for kids, but API also enforces
4. **Input Validation** - Required fields validated on both client and server
5. **SQL Injection** - Protected by Supabase parameterized queries

---

## Performance Considerations

1. **Indexes** - Category index for fast filtering
2. **Client-Side Filtering** - Filtering done in browser for instant response
3. **Grid Layout** - CSS Grid for efficient rendering
4. **Lazy Loading** - Notes loaded on page load, no pagination needed (family scale)

---

## Future Enhancements (Not in Phase 1)

- Rich text editor for formatting
- Note search functionality
- Note attachments
- Note version history
- Note sharing with external family members
- Note templates
- Note expiration dates

---

## Related Features

- **Authentication** - Required for access
- **Profiles** - Role-based access control
- **Navigation** - Links to Notes page
- **Home Dashboard** - Card linking to Notes

---

## Troubleshooting

### Issue: Can't create notes
**Solution:** Check user role in `profiles` table. Must be 'father', 'mother', or 'parent'.

### Issue: Kids can see edit buttons
**Solution:** Verify profile role is 'son', 'daughter', or 'child'. Check API authorization.

### Issue: Notes not appearing
**Solution:** Check browser console for errors. Verify RLS policies are active. Check Network tab for API responses.

### Issue: Category filter not working
**Solution:** Verify category values match exactly: 'emergency', 'health', 'school', 'general'.

---

## Code References

### Key Files
- `app/notes/page.tsx` - Server component entry point
- `app/notes/notes-client.tsx` - Main client logic
- `app/api/notes/route.ts` - List and create endpoints
- `app/api/notes/[id]/route.ts` - Update and delete endpoints

### Key Functions
- `handleCreateNote()` - Create note handler
- `handleUpdateNote()` - Update note handler
- `handleDeleteNote()` - Delete note handler
- `refreshNotes()` - Refresh notes list

---

**Feature Status:** ✅ Complete and Tested  
**Documentation Version:** 1.0  
**Last Updated:** Current Session



