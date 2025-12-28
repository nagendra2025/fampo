# Rasna - Family Dashboard Documentation

**Version:** Phase 1 (In Progress)  
**Last Updated:** Current Session  
**Status:** Calendar & Tasks Features Complete

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Database Schema](#database-schema)
6. [Features Implemented](#features-implemented)
7. [API Endpoints](#api-endpoints)
8. [Authentication Flow](#authentication-flow)
9. [Next Steps](#next-steps)

---

## Project Overview

Rasna is a private family dashboard application designed for:
- Daily coordination
- Family reminders
- Shared important information
- Light structure for kids
- Preserving family memories

**Core Philosophy:** Calm, Supportive, Respectful - A digital family notice board, not a control system.

---

## Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Date Handling:** date-fns
- **UI Components:** Custom components with family-friendly design

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (for memories/photos)
- **API:** Next.js API Routes

### Deployment
- **Platform:** Vercel (planned)
- **Domain:** rasna.com (Phase 2)

---

## Project Structure

```
rasna/
├── app/
│   ├── api/
│   │   ├── events/
│   │   │   ├── route.ts              # GET, POST events
│   │   │   └── [id]/
│   │   │       └── route.ts          # PUT, DELETE event
│   │   └── tasks/
│   │       ├── route.ts              # GET, POST tasks
│   │       └── [id]/
│   │           └── route.ts          # PUT, DELETE task
│   ├── auth/
│   │   └── signout/
│   │       └── route.ts              # Sign out handler
│   ├── calendar/
│   │   ├── page.tsx                  # Calendar page (server)
│   │   ├── calendar-client.tsx      # Calendar client component
│   │   ├── event-card.tsx           # Event display card
│   │   └── event-form.tsx           # Event create/edit form
│   ├── home/
│   │   └── page.tsx                  # Home dashboard
│   ├── login/
│   │   └── page.tsx                 # Login page
│   ├── signup/
│   │   └── page.tsx                 # Signup page
│   ├── tasks/
│   │   ├── page.tsx                 # Tasks page (server)
│   │   ├── tasks-client.tsx         # Tasks client component
│   │   ├── task-card.tsx            # Task display card
│   │   └── task-form.tsx            # Task create/edit form
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Global styles
├── components/
│   └── navigation.tsx               # Top navigation
├── lib/
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       ├── server.ts               # Server Supabase client
│       └── middleware.ts          # Auth middleware
├── middleware.ts                   # Next.js middleware
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql  # Database tables & RLS
│       ├── 002_storage_setup.sql   # Storage bucket setup
│       └── 003_backfill_existing_profiles.sql  # Profile backfill
└── package.json
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- A Supabase account and project
- Git (optional)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Supabase

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for project initialization (~2 minutes)

2. **Get API Credentials**
   - Go to Project Settings → API
   - Copy `Project URL` and `anon public` key

3. **Configure Environment Variables**
   - Create `.env.local` in project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Configure Email Auth (Phase 1)**
   - Go to Authentication → Settings
   - Under "Email Auth", **disable** "Enable email confirmations"
   - This allows immediate login after signup

### Step 3: Set Up Database

1. **Run Migrations**
   - Go to Supabase Dashboard → SQL Editor
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/migrations/002_storage_setup.sql`
   - Run `supabase/migrations/003_backfill_existing_profiles.sql` (if you have existing users)

2. **Verify Tables**
   - Go to Table Editor
   - Verify these tables exist:
     - `profiles`
     - `events`
     - `tasks`
     - `notes`
     - `announcements`
     - `memories`

3. **Verify Storage**
   - Go to Storage
   - Verify `memories` bucket exists

### Step 4: Run Development Server
```bash
npm run dev
```

### Step 5: Access Application
- Open [http://localhost:3000](http://localhost:3000)
- Sign up a new account or log in

---

## Database Schema

### Tables Overview

#### 1. `profiles`
User profile information linked to `auth.users`

**Columns:**
- `id` (UUID, PK) - References `auth.users(id)`
- `email` (TEXT) - User email
- `name` (TEXT) - User name
- `role` (TEXT) - 'father', 'mother', 'son', 'daughter', 'parent', 'child'
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Auto-creation:** Trigger creates profile on user signup

#### 2. `events`
Family calendar events

**Columns:**
- `id` (UUID, PK)
- `title` (TEXT) - Event title
- `date` (DATE) - Event date
- `time` (TIME) - Optional event time
- `notes` (TEXT) - Optional notes
- `category` (TEXT) - 'school', 'health', 'travel', 'family'
- `created_by` (UUID, FK → profiles.id)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Indexes:** `date`, `category`

#### 3. `tasks`
Personal & family to-do lists

**Columns:**
- `id` (UUID, PK)
- `title` (TEXT) - Task title
- `due_date` (DATE) - Optional due date
- `assigned_to` (TEXT) - 'father', 'mother', 'son', 'daughter', 'all'
- `completed` (BOOLEAN) - Completion status
- `completed_at` (TIMESTAMPTZ) - When completed
- `created_by` (UUID, FK → profiles.id)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Indexes:** `assigned_to`, `completed`, `due_date`

#### 4. `notes`
Family notes & important information

**Columns:**
- `id` (UUID, PK)
- `title` (TEXT) - Note title
- `content` (TEXT) - Note content
- `category` (TEXT) - 'emergency', 'health', 'school', 'general'
- `is_readonly_for_kids` (BOOLEAN) - Kids can't edit if true
- `created_by` (UUID, FK → profiles.id)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Indexes:** `category`

**RLS:** Only parents can create/edit/delete (if `is_readonly_for_kids` is true)

#### 5. `announcements`
Broadcast short messages

**Columns:**
- `id` (UUID, PK)
- `message` (TEXT) - Announcement message
- `expires_at` (TIMESTAMPTZ) - Optional expiry
- `created_by` (UUID, FK → profiles.id)
- `created_at` (TIMESTAMPTZ)

**Indexes:** `expires_at`

**RLS:** Only shows active announcements (not expired)

#### 6. `memories`
Family memories with photos

**Columns:**
- `id` (UUID, PK)
- `photo_url` (TEXT) - URL to photo in storage
- `note` (TEXT) - Optional note
- `created_by` (UUID, FK → profiles.id)
- `created_at` (TIMESTAMPTZ)

**Indexes:** `created_at` (DESC)

**Storage:** Photos stored in `memories` bucket

### Row Level Security (RLS)

All tables have RLS enabled with policies:
- **Events, Tasks, Announcements, Memories:** All authenticated users can view/create/update/delete
- **Notes:** All can view, but only parents can create/edit/delete (when `is_readonly_for_kids` is true)
- **Profiles:** All can view, users can update their own

---

## Features Implemented

### ✅ 1. Authentication & Access

**Status:** Complete

**Features:**
- Email + password authentication
- Sign up page (`/signup`)
- Login page (`/login`)
- Sign out functionality
- Session persistence
- Protected routes (middleware redirects to login)

**Files:**
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/auth/signout/route.ts`
- `middleware.ts`
- `lib/supabase/middleware.ts`

**Phase 1 Behavior:**
- No email confirmation required
- Immediate login after signup
- All users have equal access

---

### ✅ 2. Family Calendar & Events

**Status:** Complete

**Features:**
- Create events with:
  - Title (required)
  - Date (required)
  - Time (optional)
  - Notes (optional)
  - Category: School, Health, Travel, Family
- List view (upcoming first)
- Edit events
- Delete events
- Category badges with color coding:
  - School = Blue
  - Health = Red
  - Travel = Green
  - Family = Purple
- Date formatting: "Today", "Tomorrow", or full date
- Past events shown separately

**Files:**
- `app/calendar/page.tsx`
- `app/calendar/calendar-client.tsx`
- `app/calendar/event-card.tsx`
- `app/calendar/event-form.tsx`
- `app/api/events/route.ts`
- `app/api/events/[id]/route.ts`

**UI:**
- Minimal list design
- Category badges
- Modal form for create/edit
- Family-friendly colors and fonts

---

### ✅ 3. Personal & Family To-Do Lists

**Status:** Complete

**Features:**
- Create tasks with:
  - Title (required)
  - Due date (optional)
  - Assigned to: Father, Mother, Son, Daughter, All
- Mark tasks as complete/incomplete (checkbox)
- Filter by assignee
- Edit tasks
- Delete tasks
- Assignee badges with color coding:
  - Father = Blue
  - Mother = Pink
  - Son = Green
  - Daughter = Purple
  - Everyone = Gray
- Due date handling:
  - "Due today"
  - "Overdue" (red border)
  - Future dates
- Completed tasks archived in separate section
- Strikethrough for completed tasks

**Files:**
- `app/tasks/page.tsx`
- `app/tasks/tasks-client.tsx`
- `app/tasks/task-card.tsx`
- `app/tasks/task-form.tsx`
- `app/api/tasks/route.ts`
- `app/api/tasks/[id]/route.ts`

**UI:**
- Checkbox list
- Filter dropdown
- Active/Completed sections
- Overdue indicator (red border)

---

### 🚧 4. Family Notes & Important Info

**Status:** Not Started

**Planned Features:**
- Create notes with:
  - Title
  - Content
  - Category: Emergency, Health, School, General
- Editable by parents
- Kids read-only (optional toggle)
- Examples: Wi-Fi password, doctor contact, school instructions

---

### 🚧 5. Announcements (Not Chat)

**Status:** Not Started

**Planned Features:**
- Create announcement:
  - Short message
  - Auto-expiry (optional)
- Read-only messages
- No replies, no threads
- Examples: "Dinner at 8 PM", "Leaving at 6:30 AM tomorrow"

---

### 🚧 6. Family Memories

**Status:** Not Started

**Planned Features:**
- Upload photo
- Add short note
- Auto timestamp
- Timeline view
- Storage in Supabase Storage

---

## API Endpoints

### Authentication
- `POST /auth/signout` - Sign out user

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Request/Response Examples

#### Create Event
```typescript
POST /api/events
Body: {
  title: "School Science Fair",
  date: "2024-01-20",
  time: "14:00",
  notes: "Bring project board",
  category: "school"
}
```

#### Create Task
```typescript
POST /api/tasks
Body: {
  title: "Buy groceries",
  due_date: "2024-01-15",
  assigned_to: "mother"
}
```

#### Update Task (Mark Complete)
```typescript
PUT /api/tasks/[id]
Body: {
  title: "Buy groceries",
  due_date: "2024-01-15",
  assigned_to: "mother",
  completed: true
}
```

---

## Authentication Flow

### Sign Up Flow
1. User visits `/signup`
2. Enters email and password
3. Supabase creates user in `auth.users`
4. Trigger automatically creates profile in `profiles` table
5. User is immediately signed in (Phase 1 - no email confirmation)
6. Redirected to `/home`

### Login Flow
1. User visits `/login`
2. Enters email and password
3. Supabase authenticates
4. Session created
5. Redirected to `/home`

### Protected Routes
- Middleware checks authentication on all routes except `/login`, `/signup`, `/`
- Unauthenticated users redirected to `/login`
- Session persists across page refreshes

### Sign Out Flow
1. User clicks "Sign Out"
2. POST request to `/auth/signout`
3. Supabase session cleared
4. Redirected to `/login`

---

## UI/UX Design Principles

### Design Rules
- **Calm colors** - Blues, indigos, purples
- **Large readable fonts** - Easy for all ages
- **Minimal UI** - No distractions
- **Mobile-first** - Responsive design
- **Family-friendly** - Supportive, not controlling

### Navigation
- Top navigation bar with links to:
  - Home
  - Calendar
  - Tasks
  - Notes (coming soon)
  - Announcements (coming soon)
  - Memories (coming soon)
- Sign out button in navigation

### Color Scheme
- Background: Gradient from blue-50 to purple-50
- Cards: White with shadow
- Primary: Indigo-600
- Category colors: Blue, Red, Green, Purple
- Assignee colors: Blue, Pink, Green, Purple, Gray

---

## Next Steps

### Phase 1 Remaining Features

1. **Family Notes & Important Info** ⭐
   - Create notes page
   - CRUD operations
   - Category filtering
   - Parent-only edit functionality

2. **Announcements** ⭐
   - Create announcements page
   - Auto-expiry handling
   - Read-only display
   - Simple message list

3. **Family Memories** ⭐
   - Photo upload
   - Timeline view
   - Photo upload to Supabase Storage
   - Note attachment
   - Chronological display

### Phase 2 Enhancements

- Enable email confirmation
- Password reset flows
- Custom domain (rasna.com)
- Enhanced profile management
- Additional features as needed

---

## Testing Checklist

### Authentication
- [x] Sign up new user
- [x] Login existing user
- [x] Sign out
- [x] Protected route redirect
- [x] Session persistence

### Calendar
- [x] Create event
- [x] Edit event
- [x] Delete event
- [x] View events list
- [x] Category badges
- [x] Date formatting
- [x] Past events separation

### Tasks
- [x] Create task
- [x] Edit task
- [x] Delete task
- [x] Mark complete/incomplete
- [x] Filter by assignee
- [x] Due date handling
- [x] Overdue indicator
- [x] Completed tasks section

---

## Troubleshooting

### Common Issues

**Events/Tasks not appearing:**
- Check browser console for errors
- Verify Supabase environment variables
- Check Network tab for API call status
- Verify database tables exist

**Authentication not working:**
- Verify email confirmations are disabled (Phase 1)
- Check Supabase project settings
- Verify environment variables are set
- Check middleware is working

**Profile not created:**
- Run migration `003_backfill_existing_profiles.sql`
- Check trigger `on_auth_user_created` exists
- Verify function `handle_new_user()` exists

---

## Deployment Notes

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Vercel Deployment
1. Push code to Git repository
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Phase 2: Custom Domain
- Configure `rasna.com` in Vercel project settings
- Update DNS records as instructed

---

## Development Notes

### Code Style
- TypeScript strict mode
- Functional components
- Server Components where possible
- Client Components only when needed
- Tailwind CSS for styling

### Best Practices
- RLS enabled on all tables
- Server-side data fetching
- Client-side interactivity only when needed
- Error handling in API routes
- User-friendly error messages

---

## Support & Resources

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS:** [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

**Document Version:** 1.0  
**Last Updated:** Current Session  
**Maintained By:** Development Team

