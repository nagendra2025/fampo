# Rasna - Family Dashboard

A private family dashboard for daily coordination, reminders, and preserving family memories. Built with Next.js 15, TypeScript, and Supabase.

## Features

- **Authentication** - Simple email-based authentication
- **Family Calendar & Events** - Track important dates and appointments
- **Personal & Family To-Do Lists** - Stay organized with tasks
- **Family Notes & Important Info** - Centralized information storage
- **Announcements** - Quick messages without chat noise
- **Family Memories** - Preserve special moments with photos

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Setup Instructions

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings → API
   - Copy your Project URL and anon/public key

4. **Configure environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Set up Supabase Database**:
   - See [supabase/SETUP.md](./supabase/SETUP.md) for detailed instructions
   - Run the SQL migrations in Supabase SQL Editor:
     - `001_initial_schema.sql` - Creates all tables and RLS policies
     - `002_storage_setup.sql` - Sets up storage bucket
     - `003_backfill_existing_profiles.sql` - Creates profiles for existing users

6. **Configure Supabase Auth** (Important for Phase 1):
   - Go to Authentication → Settings in your Supabase dashboard
   - Under "Email Auth", disable "Enable email confirmations" for Phase 1
   - This allows immediate login after signup (as per PRD requirements)

7. **Run the development server**:
   ```bash
   npm run dev
   ```

8. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
rasna/
├── app/
│   ├── api/           # API routes (events, tasks)
│   ├── auth/          # Authentication routes
│   ├── calendar/      # Calendar & Events feature
│   ├── home/          # Main dashboard
│   ├── login/         # Login page
│   ├── signup/        # Signup page
│   ├── tasks/         # To-Do Lists feature
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Landing page
├── components/        # Shared components (navigation)
├── lib/
│   └── supabase/      # Supabase client utilities
├── supabase/
│   └── migrations/    # Database migrations
├── middleware.ts      # Auth middleware
└── ...
```

## Development Notes

### Phase 1 Implementation Status

✅ **Completed:**
- Authentication setup (email + password, no confirmation)
- Landing page
- Login/Signup pages
- Home dashboard page
- Navigation structure
- Database schema and RLS policies
- **Calendar & Events feature** ⭐
- **To-Do Lists feature** ⭐

🚧 **Next Steps:**
- Family Notes feature
- Announcements feature
- Family Memories feature

### Authentication Flow

- Users can sign up and immediately log in (no email confirmation in Phase 1)
- All pages except `/login` and `/signup` require authentication
- Session persists across page refreshes
- Sign out available from the home page

## Deployment

### Deploy to Vercel

1. Push your code to a Git repository
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Custom Domain (Phase 2)

After initial deployment, configure `rasna.com` in Vercel project settings.

## Philosophy

This app is designed to be:
- **Calm** - No notifications, no pressure, no distractions
- **Supportive** - Designed to help, not control
- **Respectful** - A digital notice board, not surveillance

## Documentation

For detailed documentation, see:
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete project documentation
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Quick status reference
- **[supabase/SETUP.md](./supabase/SETUP.md)** - Database setup instructions

## Documentation

For detailed documentation, see:
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete project documentation
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Quick status reference
- **[supabase/SETUP.md](./supabase/SETUP.md)** - Database setup instructions

## License

Private family project.
