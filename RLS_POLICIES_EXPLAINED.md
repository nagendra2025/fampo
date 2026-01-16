# Row Level Security (RLS) Policies - Complete Explanation

## Table of Contents
1. [What is RLS?](#what-is-rls)
2. [How RLS Works in Supabase](#how-rls-works-in-supabase)
3. [Memories: All Users Can Create](#memories-all-users-can-create)
4. [Notes: Only Parents Can Create](#notes-only-parents-can-create)
5. [Architecture Diagram](#architecture-diagram)
6. [Code Flow Examples](#code-flow-examples)

---

## What is RLS?

**Row Level Security (RLS)** is a PostgreSQL feature that automatically filters database queries based on policies you define. In Supabase, RLS policies are enforced at the **database level**, meaning they work regardless of how you access the data (API, direct SQL, etc.).

### Key Concepts:
- **RLS is automatic**: Once enabled, every query is automatically filtered
- **Policies are SQL expressions**: They return `true` or `false` for each row
- **Enforced at database level**: Cannot be bypassed by application code
- **Uses `auth.uid()`**: Gets the current user's ID from the JWT token

---

## How RLS Works in Supabase

### 1. Authentication Flow

```
User Login → JWT Token Created → Token Stored in Cookie → 
Supabase Client Includes Token → Database Checks Token → 
auth.uid() Returns User ID → RLS Policy Evaluates
```

### 2. Policy Evaluation

When a query runs, Supabase:
1. Extracts the user ID from the JWT token (`auth.uid()`)
2. Evaluates the RLS policy for each row
3. Only returns rows where the policy returns `true`
4. Blocks operations (INSERT/UPDATE/DELETE) if policy returns `false`

---

## Memories: All Users Can Create

### Database Schema

```sql
-- Table Definition
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_url TEXT NOT NULL,
  note TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can create
CREATE POLICY "All authenticated users can create memories"
  ON memories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

### Policy Breakdown

```sql
WITH CHECK (auth.role() = 'authenticated')
```

**What this means:**
- `auth.role()`: Returns the user's authentication role from the JWT token
- `= 'authenticated'`: Checks if the user is logged in
- **Result**: If user is logged in (parent OR child), the INSERT is allowed

### API Route Code

**File**: `app/api/memories/route.ts`

```typescript
export async function POST(request: Request) {
  // 1. Create Supabase client (includes user's JWT token)
  const supabase = await createClient();

  // 2. Get current user from token
  const { data: { user } } = await supabase.auth.getUser();

  // 3. Check if user is authenticated (application-level check)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 4. Get user profile (to get user ID for created_by field)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  // 5. Insert memory (RLS policy is automatically checked here!)
  const { data: memory, error } = await supabase
    .from("memories")
    .insert({
      photo_url,
      note: note || null,
      created_by: profile.id,  // Links to profiles table
    })
    .select()
    .single();

  // If RLS policy fails, error will contain permission denied message
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ memory }, { status: 201 });
}
```

### What Happens When a Kid Creates a Memory

1. **Frontend** (`app/memories/memories-client.tsx`):
   ```typescript
   const handleCreateMemory = async (memoryData) => {
     const response = await fetch("/api/memories", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(memoryData),
     });
   };
   ```

2. **API Route** (`app/api/memories/route.ts`):
   - Receives request with user's JWT token in cookies
   - Creates Supabase client (token automatically included)
   - Calls `supabase.from("memories").insert(...)`

3. **Supabase Client** (`lib/supabase/server.ts`):
   - Sends request to Supabase with JWT token
   - Token includes: `{ user_id: "kid-uuid", role: "authenticated" }`

4. **Database RLS Policy Check**:
   ```sql
   -- Policy evaluates:
   auth.role() = 'authenticated'  -- Returns TRUE for kid
   -- Result: INSERT allowed ✅
   ```

5. **Database Insert**:
   - Row inserted into `memories` table
   - `created_by` field links to `profiles` table via foreign key

### Tables Involved

```
┌─────────────┐         ┌──────────────┐
│ auth.users  │         │  profiles    │
│             │────────▶│              │
│ - id        │ 1:1     │ - id (FK)    │
│ - email     │         │ - role       │
└─────────────┘         └──────┬───────┘
                               │
                               │ created_by (FK)
                               │
                               ▼
                        ┌──────────────┐
                        │   memories   │
                        │              │
                        │ - id         │
                        │ - photo_url   │
                        │ - note       │
                        │ - created_by │
                        │ - created_at │
                        └──────────────┘
```

---

## Notes: Only Parents Can Create

### Database Schema

```sql
-- Table Definition
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  is_readonly_for_kids BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only parents can create
CREATE POLICY "Parents can create notes"
  ON notes FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('father', 'mother', 'parent')
    )
  );
```

### Policy Breakdown

```sql
WITH CHECK (
  auth.role() = 'authenticated' AND                    -- User must be logged in
  EXISTS (                                             -- Check profiles table
    SELECT 1 FROM profiles
    WHERE id = auth.uid()                              -- Match current user's ID
    AND role IN ('father', 'mother', 'parent')        -- Role must be parent
  )
)
```

**What this means:**
1. User must be authenticated (`auth.role() = 'authenticated'`)
2. User's ID must exist in `profiles` table (`id = auth.uid()`)
3. User's role must be parent (`role IN ('father', 'mother', 'parent')`)
4. **Result**: Only if ALL conditions are true, INSERT is allowed

### API Route Code

**File**: `app/api/notes/route.ts`

```typescript
export async function POST(request: Request) {
  // 1. Create Supabase client (includes user's JWT token)
  const supabase = await createClient();

  // 2. Get current user from token
  const { data: { user } } = await supabase.auth.getUser();

  // 3. Application-level authentication check
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 4. APPLICATION-LEVEL ROLE CHECK (additional security layer)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isParent = ["father", "mother", "parent"].includes(profile.role || "");

  // 5. Explicit check before attempting insert
  if (!isParent) {
    return NextResponse.json(
      { error: "Only parents can create notes" },
      { status: 403 }
    );
  }

  // 6. Insert note (RLS policy will also check, but we already checked above)
  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      title,
      content,
      category,
      is_readonly_for_kids: is_readonly_for_kids || false,
      created_by: user.id,
    })
    .select()
    .single();

  // If RLS policy fails (shouldn't happen due to check above), error will be returned
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ note }, { status: 201 });
}
```

### What Happens When a Kid Tries to Create a Note

#### Scenario 1: Kid Tries via API (Application-Level Check)

1. **Frontend** (`app/notes/notes-client.tsx`):
   ```typescript
   // Button is hidden for kids, but if they somehow call the API:
   const handleCreateNote = async (noteData) => {
     const response = await fetch("/api/notes", {
       method: "POST",
       body: JSON.stringify(noteData),
     });
   };
   ```

2. **API Route** (`app/api/notes/route.ts`):
   - Gets user profile
   - Checks role: `isParent = false` (kid is "son" or "daughter")
   - **Returns 403 error BEFORE attempting database insert**
   - Kid never reaches the database

#### Scenario 2: Kid Tries Direct Database Access (RLS Check)

If a kid somehow bypasses the API and tries direct database access:

1. **Direct SQL Query**:
   ```sql
   INSERT INTO notes (title, content, category, created_by)
   VALUES ('Test', 'Content', 'general', 'kid-uuid');
   ```

2. **Database RLS Policy Check**:
   ```sql
   -- Policy evaluates:
   auth.role() = 'authenticated'  -- TRUE (kid is logged in)
   AND EXISTS (
     SELECT 1 FROM profiles
     WHERE id = auth.uid()           -- TRUE (kid's ID exists)
     AND role IN ('father', 'mother', 'parent')  -- FALSE (kid is "son")
   )
   -- Result: FALSE (kid's role is "son", not in parent list)
   -- INSERT blocked ❌
   ```

3. **Database Response**:
   - Returns error: "new row violates row-level security policy"
   - No row is inserted

### Tables Involved

```
┌─────────────┐         ┌──────────────┐
│ auth.users  │         │  profiles     │
│             │────────▶│              │
│ - id        │ 1:1     │ - id (FK)     │
│ - email     │         │ - role        │◀─── RLS Policy checks this!
└─────────────┘         │ - name        │
                       └──────┬───────┘
                               │
                               │ created_by (FK)
                               │
                               ▼
                        ┌──────────────┐
                        │    notes     │
                        │              │
                        │ - id         │
                        │ - title      │
                        │ - content    │
                        │ - category   │
                        │ - created_by │
                        │ - created_at │
                        └──────────────┘
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Kid or Parent)                     │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              │ 1. User Action (Click "Add Memory/Note")
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Component)                    │
│  app/memories/memories-client.tsx  OR  app/notes/notes-client.tsx│
│                                                                   │
│  handleCreateMemory() {                                          │
│    fetch("/api/memories", { method: "POST", body: data })        │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              │ 2. HTTP Request (with JWT cookie)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTE                             │
│  app/api/memories/route.ts  OR  app/api/notes/route.ts           │
│                                                                   │
│  POST(request) {                                                 │
│    1. createClient() ← Gets JWT from cookies                    │
│    2. supabase.auth.getUser() ← Validates JWT                    │
│    3. [For Notes Only] Check role in profiles table              │
│    4. supabase.from("table").insert() ← Sends to Supabase        │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              │ 3. Supabase Client Request
                              │    (includes JWT token)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENT LIBRARY                       │
│  lib/supabase/server.ts                                          │
│                                                                   │
│  createServerClient() {                                          │
│    - Reads JWT from cookies                                      │
│    - Sends request to Supabase API                               │
│    - Includes Authorization header with JWT                      │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              │ 4. HTTP Request to Supabase
                              │    Authorization: Bearer <JWT>
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE API (PostgREST)                     │
│                                                                   │
│  1. Validates JWT token                                          │
│  2. Extracts user_id from JWT                                   │
│  3. Sets auth.uid() = user_id                                    │
│  4. Sets auth.role() = 'authenticated'                          │
│  5. Forwards query to PostgreSQL                                │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              │ 5. SQL Query with auth context
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  RLS POLICY EVALUATION                                    │  │
│  │                                                            │  │
│  │  For INSERT on memories:                                  │  │
│  │    WITH CHECK (auth.role() = 'authenticated')            │  │
│  │    → Returns TRUE for any logged-in user ✅              │  │
│  │                                                            │  │
│  │  For INSERT on notes:                                     │  │
│  │    WITH CHECK (                                            │  │
│  │      auth.role() = 'authenticated' AND                    │  │
│  │      EXISTS (                                              │  │
│  │        SELECT 1 FROM profiles                             │  │
│  │        WHERE id = auth.uid()                              │  │
│  │        AND role IN ('father', 'mother', 'parent')         │  │
│  │      )                                                     │  │
│  │    )                                                       │  │
│  │    → Returns TRUE only for parents ✅                     │  │
│  │    → Returns FALSE for kids ❌                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  IF POLICY RETURNS TRUE:                                  │  │
│  │    → Execute INSERT/UPDATE/DELETE                         │  │
│  │    → Return success                                       │  │
│  │                                                            │  │
│  │  IF POLICY RETURNS FALSE:                                 │  │
│  │    → Block operation                                      │  │
│  │    → Return error: "row-level security policy violation" │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  TABLES                                                   │  │
│  │                                                            │  │
│  │  auth.users (Supabase Auth)                               │  │
│  │    └─ id (UUID)                                           │  │
│  │                                                            │  │
│  │  profiles                                                  │  │
│  │    ├─ id (FK → auth.users.id)                             │  │
│  │    └─ role ('father', 'mother', 'son', 'daughter')        │  │
│  │                                                            │  │
│  │  memories                                                  │  │
│  │    ├─ id                                                   │  │
│  │    ├─ photo_url                                           │  │
│  │    ├─ note                                                │  │
│  │    └─ created_by (FK → profiles.id)                       │  │
│  │                                                            │  │
│  │  notes                                                     │  │
│  │    ├─ id                                                   │  │
│  │    ├─ title                                               │  │
│  │    ├─ content                                             │  │
│  │    ├─ category                                            │  │
│  │    └─ created_by (FK → profiles.id)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              │ 6. Success or Error Response
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE FLOW (Back to Frontend)             │
│                                                                   │
│  Success: { memory/note: {...} }                                 │
│  Error: { error: "message" }                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Code Flow Examples

### Example 1: Kid Creates Memory (Success)

```typescript
// 1. Frontend: Kid clicks "Add Memory"
// app/memories/memories-client.tsx
const handleCreateMemory = async ({ photo_url, note }) => {
  const response = await fetch("/api/memories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ photo_url, note }),
  });
  // Cookie with JWT automatically included
};

// 2. API Route: app/api/memories/route.ts
export async function POST(request: Request) {
  const supabase = await createClient(); // JWT from cookie
  const { data: { user } } = await supabase.auth.getUser();
  // user = { id: "kid-uuid-123", email: "kid@example.com" }
  
  // No role check - all authenticated users allowed
  
  const { data: memory, error } = await supabase
    .from("memories")
    .insert({ photo_url, note, created_by: user.id });
  // Supabase sends: INSERT INTO memories ... WITH JWT token
  
  // 3. Database RLS Policy Check:
  // auth.role() = 'authenticated' → TRUE ✅
  // INSERT allowed
  
  return NextResponse.json({ memory }, { status: 201 });
}
```

### Example 2: Kid Tries to Create Note (Blocked)

```typescript
// 1. Frontend: Kid somehow calls API (button hidden, but direct call)
// app/notes/notes-client.tsx
const handleCreateNote = async ({ title, content, category }) => {
  const response = await fetch("/api/notes", {
    method: "POST",
    body: JSON.stringify({ title, content, category }),
  });
};

// 2. API Route: app/api/notes/route.ts
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // user = { id: "kid-uuid-123", email: "kid@example.com" }
  
  // APPLICATION-LEVEL CHECK
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  // profile = { role: "son" }
  
  const isParent = ["father", "mother", "parent"].includes(profile.role);
  // isParent = false
  
  if (!isParent) {
    // BLOCKED HERE - Never reaches database
    return NextResponse.json(
      { error: "Only parents can create notes" },
      { status: 403 }
    );
  }
  
  // This code never executes for kids
  const { data: note, error } = await supabase
    .from("notes")
    .insert({ title, content, category, created_by: user.id });
}
```

### Example 3: Parent Creates Note (Success)

```typescript
// 1. Frontend: Parent clicks "Add Note"
// app/notes/notes-client.tsx
const handleCreateNote = async ({ title, content, category }) => {
  const response = await fetch("/api/notes", {
    method: "POST",
    body: JSON.stringify({ title, content, category }),
  });
};

// 2. API Route: app/api/notes/route.ts
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // user = { id: "parent-uuid-456", email: "parent@example.com" }
  
  // APPLICATION-LEVEL CHECK
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  // profile = { role: "father" }
  
  const isParent = ["father", "mother", "parent"].includes(profile.role);
  // isParent = true ✅
  
  if (!isParent) {
    // Skipped - parent passes check
  }
  
  const { data: note, error } = await supabase
    .from("notes")
    .insert({ title, content, category, created_by: user.id });
  // Supabase sends: INSERT INTO notes ... WITH JWT token
  
  // 3. Database RLS Policy Check:
  // auth.role() = 'authenticated' → TRUE ✅
  // EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('father', 'mother', 'parent'))
  //   → TRUE ✅ (parent's role is "father")
  // INSERT allowed ✅
  
  return NextResponse.json({ note }, { status: 201 });
}
```

---

## Key Differences Summary

| Feature | Memories | Notes |
|---------|----------|-------|
| **RLS Policy** | `auth.role() = 'authenticated'` | `auth.role() = 'authenticated' AND role IN ('father', 'mother', 'parent')` |
| **Application Check** | None | Explicit role check in API route |
| **Kids Can Create** | ✅ Yes | ❌ No |
| **Parents Can Create** | ✅ Yes | ✅ Yes |
| **Database Tables Used** | `memories`, `profiles` | `notes`, `profiles` |
| **Policy Checks** | Only authentication | Authentication + role from profiles table |

---

## Security Layers

### Memories (2 Layers)
1. **Application Layer**: Checks if user is authenticated
2. **Database Layer (RLS)**: Checks if user is authenticated

### Notes (3 Layers)
1. **Application Layer**: Checks if user is authenticated
2. **Application Layer**: Explicitly checks if user is parent (returns 403)
3. **Database Layer (RLS)**: Checks authentication + role (blocks if kid somehow bypasses API)

---

## Important Notes

1. **RLS is Automatic**: Once enabled, it applies to ALL queries, even direct SQL
2. **JWT Token Required**: `auth.uid()` and `auth.role()` only work with valid JWT tokens
3. **Profiles Table is Key**: For role-based policies, the `profiles` table must exist and be populated
4. **Foreign Keys**: `created_by` fields link to `profiles.id`, which links to `auth.users.id`
5. **Defense in Depth**: Notes have both application-level AND database-level checks for extra security

---

**Last Updated**: 2025-01-27
**Status**: Complete Documentation ✅



