# How to Merge Feature Branch into Main on GitHub

## Method 1: Using GitHub Pull Request (Recommended) ⭐

This method is recommended because it:
- Creates a record of the merge
- Allows review of changes before merging
- Provides better visibility and collaboration

### Step-by-Step:

1. **Go to your GitHub repository:**
   ```
   https://github.com/nagendra2025/rasna
   ```

2. **Click on "Pull requests" tab** (at the top of the repository page)

3. **Click "New pull request" button** (green button on the right)

4. **Select branches:**
   - **Base branch:** `main` (the branch you want to merge INTO)
   - **Compare branch:** `Creating-whatsapp-notfication-for-events-tasks` (your feature branch)
   
   If you don't see your branch, click "compare across forks" and select your branch.

5. **Review the changes:**
   - GitHub will show you all the files that will be merged
   - You can review each change before merging

6. **Fill in the pull request details:**
   - **Title:** `Add WhatsApp and SMS Notifications Feature`
   - **Description:** 
     ```
     This PR adds WhatsApp and SMS notification functionality:
     - User and app-level notification preferences
     - Scheduled daily reminders for events/tasks
     - Twilio integration
     - Rate limit handling and auto-disable
     - Settings page for managing notifications
     ```

7. **Click "Create pull request"** (green button)

8. **Review and merge:**
   - Scroll down to see the PR details
   - Click "Merge pull request" button (green button at bottom)
   - Click "Confirm merge" to finalize

9. **Optional - Delete the branch:**
   - After merging, GitHub will offer to delete the feature branch
   - Click "Delete branch" if you want to clean up (recommended)

---

## Method 2: Using Git Commands (Command Line)

If you prefer using the command line:

### Step-by-Step:

1. **Switch to main branch:**
   ```bash
   git checkout main
   ```

2. **Pull latest changes from remote:**
   ```bash
   git pull origin main
   ```
   This ensures your local main is up-to-date.

3. **Merge your feature branch:**
   ```bash
   git merge Creating-whatsapp-notfication-for-events-tasks
   ```
   
   If there are conflicts, resolve them, then:
   ```bash
   git add .
   git commit -m "Merge feature branch: WhatsApp and SMS notifications"
   ```

4. **Push to remote main:**
   ```bash
   git push origin main
   ```

5. **Optional - Delete the feature branch:**
   ```bash
   # Delete local branch
   git branch -d Creating-whatsapp-notfication-for-events-tasks
   
   # Delete remote branch
   git push origin --delete Creating-whatsapp-notfication-for-events-tasks
   ```

---

## Quick Link to Create PR

**Direct link to create PR:**
```
https://github.com/nagendra2025/rasna/compare/main...Creating-whatsapp-notfication-for-events-tasks
```

Just click this link, add a title/description, and click "Create pull request"!

---

## After Merging

### 1. Run Database Migrations (In Supabase)
   - Go to Supabase Dashboard → SQL Editor
   - Run: `supabase/migrations/009_add_notifications.sql`
   - Run: `supabase/migrations/010_add_app_settings.sql`

### 2. Verify Environment Variables (In Vercel)
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify these are set:
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_AUTH_TOKEN`
     - `TWILIO_SMS_FROM`
     - `TWILIO_WHATSAPP_FROM`

### 3. Verify Deployment
   - Check that Vercel automatically deployed the new code
   - Verify the Settings page works: `https://your-domain.com/settings`

---

## Troubleshooting

### If you see "This branch has conflicts":
   - Click "Resolve conflicts" button
   - GitHub will show you the conflicting files
   - Resolve conflicts manually or click "Resolve using theirs/ours"
   - Click "Mark as resolved" and commit

### If merge fails:
   - Make sure your local main is up-to-date: `git pull origin main`
   - Make sure feature branch is pushed: `git push origin Creating-whatsapp-notfication-for-events-tasks`

### If you don't see your branch in the dropdown:
   - Make sure the branch is pushed: `git push origin Creating-whatsapp-notfication-for-events-tasks`
   - Refresh the GitHub page
   - Try the direct PR link above

---

## Summary

**Recommended Method:** GitHub Pull Request (Method 1)
- Best practice for collaboration
- Creates a record of changes
- Allows review before merging

**Quick Command Line:** Use Method 2 if you're comfortable with git commands

**After merge:** Don't forget to run database migrations in Supabase!



