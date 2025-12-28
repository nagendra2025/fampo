# Database Schema Setup Instructions

This guide will help you set up the database schema for Rasna in your Supabase project.

## Prerequisites

- A Supabase project created
- Access to your Supabase project dashboard

## Setup Steps

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**

   - Go to [supabase.com](https://supabase.com)
   - Select your project

2. **Open SQL Editor**

   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Migration 1: Initial Schema**

   - Open the file `supabase/migrations/001_initial_schema.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for success message

4. **Run Migration 2: Storage Setup**

   - Open the file `supabase/migrations/002_storage_setup.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run"
   - Wait for success message

5. **Run Migration 3: Backfill Existing Profiles** (Important!)

   - If you have existing users in `auth.users` (created before the schema), run this:
   - Open the file `supabase/migrations/003_backfill_existing_profiles.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run"
   - This will create profiles for user1, user2, and any other existing users
   - Wait for success message

6. **Verify Setup**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `profiles`
     - `events`
     - `tasks`
     - `notes`
     - `announcements`
     - `memories`
   - Go to "Storage" in the left sidebar
   - You should see a bucket named `memories`

### Option 2: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## What Gets Created

### Tables

1. **profiles** - User profile information
2. **events** - Family calendar events
3. **tasks** - Personal & family to-do lists
4. **notes** - Family notes & important information
5. **announcements** - Broadcast messages
6. **memories** - Family memories with photos

### Security

- **Row Level Security (RLS)** enabled on all tables
- Policies configured for family access:
  - All authenticated users can view most data
  - All authenticated users can create/update/delete their own data
  - Notes have special rules: only parents can edit (if `is_readonly_for_kids` is true)

### Storage

- **memories** bucket created for photo storage
- Policies allow all authenticated family members to upload/view photos

### Automatic Features

- **Profile Creation**: When a user signs up, a profile is automatically created
- **Updated Timestamps**: `updated_at` fields automatically update on record changes

## Testing the Setup

After running the migrations:

1. **Sign up a new user** in your app
2. **Check the profiles table**:

   - Go to Table Editor → profiles
   - You should see a new row with the user's information

3. **Test RLS**:
   - Try creating an event, task, or note through your app
   - Check the respective tables to see the data

## Troubleshooting

### Error: "relation already exists"

- Some tables might already exist. You can either:
  - Drop existing tables and re-run migrations (⚠️ deletes data)
  - Or modify the SQL to use `CREATE TABLE IF NOT EXISTS` (already included)

### Error: "permission denied"

- Make sure you're running the SQL as the project owner
- Check that RLS policies are correctly applied

### Profile not created automatically

- Check the trigger `on_auth_user_created` exists
- Verify the function `handle_new_user()` exists and is working
- **For existing users**: Run migration `003_backfill_existing_profiles.sql` to create profiles for users that existed before the trigger was set up

## Next Steps

After the database is set up:

1. ✅ Test authentication (should already work)
2. ✅ Test profile creation (automatic on signup)
3. 🚧 Build Calendar feature
4. 🚧 Build Tasks feature
5. 🚧 Build Notes feature
6. 🚧 Build Announcements feature
7. 🚧 Build Memories feature

## Notes

- All timestamps use `TIMESTAMPTZ` (timezone-aware)
- UUIDs are used for all primary keys
- Foreign keys cascade on delete (if a user is deleted, their data is cleaned up)
- Indexes are created for common query patterns
