# Announcements Feature

**Status:** ✅ Complete  
**Feature #:** 5 of 6  
**Last Updated:** Current Session

---

## Overview

The Announcements feature provides a simple, read-only messaging system for broadcasting short messages to the entire family. Unlike chat or messaging systems, announcements are one-way communications with no replies, threads, or discussions. They support optional auto-expiry for time-sensitive messages.

---

## Purpose

According to the PRD, this feature serves as:
- Broadcast short messages without discussion noise
- Read-only messages (no replies, no threads)
- Optional auto-expiry for time-sensitive announcements
- Examples: "Dinner at 8 PM", "Leaving at 6:30 AM tomorrow"

---

## Features Implemented

### ✅ Core Functionality
- **Create Announcements** - All authenticated users can create announcements
- **View Announcements** - All authenticated users can view active announcements
- **Delete Announcements** - All authenticated users can delete announcements
- **Auto-Expiry** - Optional expiry date/time for announcements
- **Active Filtering** - Only active (non-expired) announcements are shown
- **Auto-Refresh** - Page automatically refreshes every minute to remove expired announcements
- **Read-Only Design** - No replies, no threads, no discussion - just announcements

### ✅ Expiry Features
- **No Expiry** - Announcements can exist indefinitely
- **Date Expiry** - Set expiry date only (expires at end of day)
- **Date + Time Expiry** - Set specific expiry date and time
- **Urgent Indicator** - Announcements expiring within 24 hours show in orange
- **Automatic Removal** - Expired announcements are automatically filtered out

### ✅ UI Features
- Clean, simple card layout
- Left border accent (indigo/blue)
- Created date/time display
- Expiry information display
- Urgent expiry indicator (< 24 hours)
- Info message explaining read-only nature
- Empty state messaging
- Responsive design

---

## File Structure

```
app/
├── announcements/
│   ├── page.tsx                    # Server component - fetches announcements
│   ├── announcements-client.tsx    # Client component - main list and logic
│   ├── announcement-card.tsx       # Individual announcement card component
│   └── announcement-form.tsx       # Modal form for creating announcements
└── api/
    └── announcements/
        ├── route.ts                # GET (list), POST (create)
        └── [id]/
            └── route.ts            # DELETE (delete)
```

---

## API Endpoints

### GET /api/announcements
**Description:** List all active (non-expired) announcements  
**Authentication:** Required  
**Authorization:** All authenticated users can view

**Response:**
```json
{
  "announcements": [
    {
      "id": "uuid",
      "message": "Dinner at 8 PM tonight",
      "expires_at": null,
      "created_by": "user-uuid",
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": "uuid",
      "message": "Leaving at 6:30 AM tomorrow",
      "expires_at": "2024-01-16T06:30:00Z",
      "created_by": "user-uuid",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

**Query Logic:**
- Only returns announcements where `expires_at IS NULL OR expires_at > NOW()`
- Sorted by `created_at DESC` (newest first)

### POST /api/announcements
**Description:** Create a new announcement  
**Authentication:** Required  
**Authorization:** All authenticated users can create

**Request Body:**
```json
{
  "message": "Dinner at 8 PM tonight",
  "expires_at": null
}
```

**Or with expiry:**
```json
{
  "message": "Leaving at 6:30 AM tomorrow",
  "expires_at": "2024-01-16T06:30:00Z"
}
```

**Response:**
```json
{
  "announcement": {
    "id": "uuid",
    "message": "Dinner at 8 PM tonight",
    "expires_at": null,
    "created_by": "user-uuid",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Error Responses:**
- `400` - Message is required or empty
- `401` - Unauthorized
- `404` - Profile not found
- `500` - Server error

### DELETE /api/announcements/[id]
**Description:** Delete an announcement  
**Authentication:** Required  
**Authorization:** All authenticated users can delete

**Response:**
```json
{
  "success": true
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

## Database Schema

### Table: `announcements`

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
- `idx_announcements_expires_at` - On `expires_at` column for filtering performance

### Row Level Security (RLS)

**View Policy:**
- All authenticated users can view active announcements
- Query filters: `expires_at IS NULL OR expires_at > NOW()`

**Create Policy:**
- All authenticated users can create announcements

**Delete Policy:**
- All authenticated users can delete announcements

**Note:** No update policy - announcements are read-only once created (can only be deleted)

---

## Dependencies

### Frontend Dependencies
- **Next.js 15** - Framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **date-fns** - Date formatting and manipulation

### Backend Dependencies
- **Supabase** - Database and authentication
- **@supabase/supabase-js** - Supabase client library
- **@supabase/ssr** - Server-side Supabase utilities

### Database Dependencies
- **PostgreSQL** (via Supabase)
- **profiles table** - For user reference

---

## Expiry Logic

### Expiry Types

1. **No Expiry** (`expires_at = NULL`)
   - Announcement remains active indefinitely
   - Displayed until manually deleted

2. **Date Only** (`expires_at = '2024-01-16T23:59:59Z'`)
   - Expires at end of specified date
   - Default behavior when only date is provided

3. **Date + Time** (`expires_at = '2024-01-16T06:30:00Z'`)
   - Expires at specific date and time
   - More precise control

### Expiry Display

- **No Expiry:** No expiry information shown
- **Future (> 24 hours):** "Expires: [date] at [time]"
- **Urgent (< 24 hours):** "Expires in X hour(s)" (orange text)

### Auto-Removal

- **Server-side:** Database query filters out expired announcements
- **Client-side:** Auto-refresh every 60 seconds removes expired announcements
- **On Load:** Page load only shows active announcements

---

## UI Components

### AnnouncementCard Component
**Location:** `app/announcements/announcement-card.tsx`

**Props:**
- `announcement` - Announcement object
- `onDelete` - Delete handler function

**Features:**
- Left border accent (indigo/blue)
- Message display with preserved formatting
- Created date/time
- Expiry information (if set)
- Urgent expiry indicator (< 24 hours)
- Delete button

### AnnouncementForm Component
**Location:** `app/announcements/announcement-form.tsx`

**Props:**
- `onSubmit` - Submit handler function
- `onClose` - Close handler function

**Fields:**
- Message (required) - Textarea
- Set expiry date (checkbox)
- Expiry Date (shown when checkbox checked)
- Expiry Time (optional, shown when checkbox checked)

**Features:**
- Date picker prevents past dates
- Default expiry date set to tomorrow when enabled
- Time picker optional

### AnnouncementsClient Component
**Location:** `app/announcements/announcements-client.tsx`

**Features:**
- State management for announcements list
- Auto-refresh every 60 seconds
- Expiry filtering (client-side backup)
- Form modal management
- CRUD operations

---

## User Experience

### Creating Announcements
1. Click "+ Add Announcement" button
2. Enter message in textarea
3. Optionally check "Set expiry date"
4. If expiry enabled, select date (and optionally time)
5. Click "Create Announcement"
6. Announcement appears in list

### Viewing Announcements
1. All active announcements displayed in chronological order (newest first)
2. Each announcement shows:
   - Message text
   - Created date/time
   - Expiry information (if set)
3. Expired announcements automatically removed

### Deleting Announcements
1. Click "Delete" button on any announcement
2. Confirm deletion
3. Announcement removed from list

---

## Testing Checklist

### Functional Testing
- [x] Create announcement without expiry
- [x] Create announcement with expiry date
- [x] Create announcement with expiry date and time
- [x] View all active announcements
- [x] Delete announcement
- [x] Auto-expiry removes expired announcements
- [x] Expired announcements don't appear in list
- [x] Urgent expiry indicator shows correctly
- [x] Auto-refresh works (every 60 seconds)

### UI Testing
- [x] Info message displays correctly
- [x] Form modal opens and closes
- [x] Expiry checkbox toggles date/time fields
- [x] Date picker prevents past dates
- [x] Announcement cards display correctly
- [x] Expiry information shows correctly
- [x] Urgent expiry shows in orange
- [x] Delete button works
- [x] Empty state shows when no announcements

### Backend Testing
- [x] GET endpoint returns only active announcements
- [x] POST endpoint creates announcement
- [x] DELETE endpoint removes announcement
- [x] Expiry filtering works in database query
- [x] Authentication required for all endpoints
- [x] Error handling works (400, 401, 500)

### Edge Cases
- [x] Empty message validation
- [x] Past date prevention
- [x] Long messages display correctly
- [x] Special characters in messages
- [x] Multiple announcements with same expiry
- [x] Announcements expiring at exact moment

---

## Example Use Cases

### 1. Simple Announcement (No Expiry)
```
Message: "Dinner at 8 PM tonight"
Expiry: None
```

### 2. Time-Sensitive Announcement
```
Message: "Leaving at 6:30 AM tomorrow"
Expiry: Tomorrow at 6:30 AM
```

### 3. Daily Reminder
```
Message: "Grocery shopping this afternoon"
Expiry: Today at 4:00 PM
```

### 4. Weekend Event
```
Message: "Family meeting this weekend"
Expiry: 3 days from now
```

### 5. Quick Notice
```
Message: "School pickup changed to 4 PM"
Expiry: Today at 4:00 PM
```

---

## Security Considerations

1. **RLS Policies** - All database operations protected by Row Level Security
2. **API Authorization** - Server-side checks for authentication
3. **Input Validation** - Message required and trimmed
4. **SQL Injection** - Protected by Supabase parameterized queries
5. **XSS Prevention** - React automatically escapes content

---

## Performance Considerations

1. **Indexes** - Expiry index for fast filtering
2. **Client-Side Filtering** - Backup filtering in browser
3. **Auto-Refresh** - Efficient 60-second interval
4. **Database Query** - Optimized with `OR` condition for expiry
5. **No Pagination** - Not needed for family scale

---

## Design Philosophy

### Read-Only by Design
- No replies
- No threads
- No discussions
- Just announcements

This keeps the feature simple and focused on one-way communication, reducing noise and maintaining clarity.

### Auto-Expiry
- Prevents announcement clutter
- Automatically removes outdated information
- Time-sensitive messages naturally expire

### Simple UI
- Clean card layout
- Minimal information
- Focus on message content
- No complex interactions

---

## Future Enhancements (Not in Phase 1)

- Rich text formatting
- Announcement categories
- Priority levels
- Scheduled announcements
- Announcement templates
- Email notifications for new announcements
- Push notifications

---

## Related Features

- **Authentication** - Required for access
- **Profiles** - User reference
- **Navigation** - Links to Announcements page
- **Home Dashboard** - Card linking to Announcements

---

## Troubleshooting

### Issue: Announcements not appearing
**Solution:** 
- Check browser console for errors
- Verify Supabase environment variables
- Check Network tab for API call status
- Verify `announcements` table exists
- Check RLS policies are active

### Issue: Expired announcements still showing
**Solution:**
- Refresh the page (auto-refresh runs every minute)
- Check `expires_at` value in database
- Verify timezone is correct
- Check API query: `expires_at > NOW()`

### Issue: Can't create announcement
**Solution:**
- Check browser console for errors
- Verify you're authenticated
- Check Network tab for API response
- Verify message field is not empty

### Issue: Delete not working
**Solution:**
- Check browser console for errors
- Verify API call is successful (Network tab)
- Check RLS policies allow deletion
- Verify announcement ID is correct

### Issue: Expiry not working
**Solution:**
- Verify date/time format is correct
- Check timezone settings
- Verify database `expires_at` column
- Check auto-refresh is running

---

## Code References

### Key Files
- `app/announcements/page.tsx` - Server component entry point
- `app/announcements/announcements-client.tsx` - Main client logic
- `app/api/announcements/route.ts` - List and create endpoints
- `app/api/announcements/[id]/route.ts` - Delete endpoint

### Key Functions
- `handleCreateAnnouncement()` - Create announcement handler
- `handleDeleteAnnouncement()` - Delete announcement handler
- `refreshAnnouncements()` - Refresh announcements list
- `getExpiryInfo()` - Calculate expiry display information

### Key Queries
```sql
-- Active announcements only
SELECT * FROM announcements 
WHERE expires_at IS NULL OR expires_at > NOW()
ORDER BY created_at DESC;
```

---

## API Testing Examples

### Browser Console Testing
```javascript
// GET all announcements
fetch('/api/announcements')
  .then(res => res.json())
  .then(console.log);

// POST new announcement
fetch('/api/announcements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Test announcement' })
})
  .then(res => res.json())
  .then(console.log);

// DELETE announcement
fetch('/api/announcements/[id]', {
  method: 'DELETE'
})
  .then(res => res.json())
  .then(console.log);
```

### Database Verification
```sql
-- Check all announcements
SELECT * FROM announcements ORDER BY created_at DESC;

-- Check only active announcements
SELECT * FROM announcements 
WHERE expires_at IS NULL OR expires_at > NOW()
ORDER BY created_at DESC;

-- Check expired announcements
SELECT * FROM announcements 
WHERE expires_at IS NOT NULL AND expires_at <= NOW();
```

---

**Feature Status:** ✅ Complete and Tested  
**Documentation Version:** 1.0  
**Last Updated:** Current Session



