# Testing Guide: Edit/Delete Restrictions

This guide will help you verify that only creators can edit/delete their own tasks, events, notes, and memories.

## Prerequisites

- Migration `008_restrict_edit_to_creator.sql` has been executed
- You have at least 2 user accounts (to test cross-user restrictions)
- Both users are logged in (use different browsers or incognito mode)

---

## Test Plan

### Test 1: Database RLS Policies (Direct Database Access)

**Purpose**: Verify that RLS policies prevent unauthorized updates/deletes at the database level.

**Steps**:
1. Log in as User A (e.g., parent account)
2. Create a task/event/note/memory
3. Note the `id` and `created_by` of the item
4. Log in as User B (e.g., child account)
5. Try to update/delete User A's item directly via Supabase SQL Editor:

```sql
-- Try to update a task created by another user (replace with actual IDs)
UPDATE tasks 
SET title = 'Hacked Title' 
WHERE id = '<task_id_from_user_a>' 
AND created_by != auth.uid();

-- Try to delete an event created by another user
DELETE FROM events 
WHERE id = '<event_id_from_user_a>' 
AND created_by != auth.uid();
```

**Expected Result**: 
- ❌ Both queries should fail or return 0 rows affected
- ✅ Error message should indicate permission denied

---

### Test 2: API Route Security (Server-Side Checks)

**Purpose**: Verify that API routes reject unauthorized update/delete requests.

**Steps**:

#### 2.1 Test Tasks API
1. **As User A**: Create a task, note the task `id`
2. **As User B**: Open browser DevTools (F12) → Network tab
3. **As User B**: Try to update User A's task:
   ```javascript
   // In browser console
   fetch('/api/tasks/<task_id_from_user_a>', {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ title: 'Hacked Task', due_date: null, assigned_to: 'all' })
   })
   .then(r => r.json())
   .then(console.log)
   ```
4. **Expected Result**: 
   - ❌ Response status: `403 Forbidden`
   - ❌ Response body: `{ "error": "You can only edit tasks you created" }`

#### 2.2 Test Events API
1. **As User A**: Create an event, note the event `id`
2. **As User B**: Try to delete User A's event:
   ```javascript
   fetch('/api/events/<event_id_from_user_a>', {
     method: 'DELETE'
   })
   .then(r => r.json())
   .then(console.log)
   ```
3. **Expected Result**: 
   - ❌ Response status: `403 Forbidden`
   - ❌ Response body: `{ "error": "You can only delete events you created" }`

#### 2.3 Test Notes API
1. **As User A (parent)**: Create a note, note the note `id`
2. **As User B (parent or child)**: Try to update User A's note:
   ```javascript
   fetch('/api/notes/<note_id_from_user_a>', {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ 
       title: 'Hacked Note', 
       content: 'Hacked content', 
       category: 'general',
       is_readonly_for_kids: false 
     })
   })
   .then(r => r.json())
   .then(console.log)
   ```
3. **Expected Result**: 
   - ❌ Response status: `403 Forbidden`
   - ❌ Response body: `{ "error": "You can only edit notes you created" }`

#### 2.4 Test Memories API
1. **As User A**: Create a memory, note the memory `id`
2. **As User B**: Try to update User A's memory:
   ```javascript
   fetch('/api/memories/<memory_id_from_user_a>', {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ note: 'Hacked note' })
   })
   .then(r => r.json())
   .then(console.log)
   ```
3. **Expected Result**: 
   - ❌ Response status: `403 Forbidden`
   - ❌ Response body: `{ "error": "You can only edit memories you created" }`

---

### Test 3: UI Behavior (Client-Side)

**Purpose**: Verify that edit/delete buttons are hidden for items not created by the current user.

#### 3.1 Test Tasks Page
1. **As User A**: Create a task titled "User A's Task"
2. **As User B**: Navigate to `/tasks`
3. **Check**: 
   - ✅ You can see "User A's Task" in the list
   - ❌ "Edit" and "Delete" buttons should NOT be visible for "User A's Task"
   - ✅ "Edit" and "Delete" buttons ARE visible for tasks created by User B

#### 3.2 Test Calendar/Events Page
1. **As User A**: Create an event titled "User A's Event"
2. **As User B**: Navigate to `/calendar`
3. **Check**: 
   - ✅ You can see "User A's Event" in the list
   - ❌ "Edit" and "Delete" buttons should NOT be visible for "User A's Event"
   - ✅ "Edit" and "Delete" buttons ARE visible for events created by User B

#### 3.3 Test Notes Page
1. **As User A (parent)**: Create a note titled "User A's Note"
2. **As User B (parent or child)**: Navigate to `/notes`
3. **Check**: 
   - ✅ You can see "User A's Note" in the list
   - ❌ "Edit" and "Delete" buttons should NOT be visible for "User A's Note"
   - ✅ "Edit" and "Delete" buttons ARE visible for notes created by User B (if User B is a parent)

#### 3.4 Test Memories Page
1. **As User A**: Create a memory with a photo
2. **As User B**: Navigate to `/memories`
3. **Check**: 
   - ✅ You can see User A's memory in the timeline
   - ❌ Hovering over User A's memory should NOT show "Edit" and "Delete" buttons
   - ✅ Hovering over User B's memories SHOULD show "Edit" and "Delete" buttons

---

### Test 4: Positive Cases (Own Items)

**Purpose**: Verify that users CAN edit/delete their own items.

**Steps**:
1. **As User A**: Create items (task, event, note, memory)
2. **As User A**: Verify you can:
   - ✅ See "Edit" and "Delete" buttons
   - ✅ Click "Edit" and successfully update the item
   - ✅ Click "Delete" and successfully delete the item
   - ✅ Toggle task completion (checkbox works)

**Expected Result**: All operations succeed without errors.

---

### Test 5: Edge Cases

#### 5.1 Task Completion Toggle
- **As User A**: Create a task
- **As User B**: Try to toggle the checkbox
- **Expected**: 
  - ❌ API call should fail with 403
  - ❌ Task completion status should NOT change
  - ✅ Error message shown to User B

#### 5.2 Notes Parent Restriction
- **As User A (parent)**: Create a note
- **As User B (child)**: Try to edit (even if somehow button is visible)
- **Expected**: 
  - ❌ API call should fail with 403
  - ❌ Note should NOT be updated

---

## Quick Verification Checklist

Use this checklist to quickly verify all aspects:

- [ ] **Database RLS**: Direct SQL updates fail for other users' items
- [ ] **Tasks API**: 403 error when User B tries to update/delete User A's task
- [ ] **Events API**: 403 error when User B tries to update/delete User A's event
- [ ] **Notes API**: 403 error when User B tries to update/delete User A's note
- [ ] **Memories API**: 403 error when User B tries to update/delete User A's memory
- [ ] **Tasks UI**: Edit/Delete buttons hidden for other users' tasks
- [ ] **Events UI**: Edit/Delete buttons hidden for other users' events
- [ ] **Notes UI**: Edit/Delete buttons hidden for other users' notes
- [ ] **Memories UI**: Edit/Delete buttons hidden for other users' memories
- [ ] **Own Items**: Users can successfully edit/delete their own items
- [ ] **Task Toggle**: Users cannot toggle completion for other users' tasks

---

## Troubleshooting

### Issue: Buttons still visible for other users' items
**Solution**: 
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for errors
4. Verify `currentUserId` is being passed correctly in server components

### Issue: API returns 200 but doesn't update
**Solution**: 
1. Check Supabase logs for RLS policy violations
2. Verify migration was applied correctly
3. Check API route logs for error messages

### Issue: Database allows updates but API doesn't
**Solution**: 
1. Verify RLS is enabled on tables: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
2. Check policy exists: `SELECT * FROM pg_policies WHERE tablename = 'tasks';`
3. Verify `created_by` column exists and has correct data type

---

## SQL Queries for Verification

Run these in Supabase SQL Editor to verify policies exist:

```sql
-- Check all policies on tasks table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'tasks';

-- Check all policies on events table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'events';

-- Check all policies on notes table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notes';

-- Check all policies on memories table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'memories';
```

You should see policies like:
- "Users can update their own tasks"
- "Users can delete their own tasks"
- "Users can update their own events"
- etc.

---

## Success Criteria

✅ **All tests pass** when:
1. Users can view all items (family-wide visibility)
2. Users can only edit/delete items they created
3. API returns 403 for unauthorized attempts
4. UI hides edit/delete buttons for other users' items
5. Database RLS prevents unauthorized changes

If all criteria are met, the fix is working correctly! 🎉



