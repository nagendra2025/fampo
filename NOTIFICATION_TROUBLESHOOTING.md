# Notification Troubleshooting Guide

## Issue: Notifications Not Received

### Problem Summary
Notifications were expected on Jan 14th for events/tasks scheduled for Jan 15th, but nothing was received.

### Root Causes Identified

1. **CRON_SECRET Authentication Issue**
   - **Problem**: If `CRON_SECRET` is set in Vercel environment variables, the code was requiring it for ALL requests, including Vercel Cron.
   - **Issue**: Vercel Cron doesn't automatically send `Authorization` headers, so requests would fail with 401 Unauthorized.
   - **Fix**: Modified the authentication logic to only enforce `CRON_SECRET` if an `Authorization` header is provided. This allows:
     - Vercel Cron to work without the header
     - Manual testing to still use the secret if needed

2. **Lack of Logging**
   - **Problem**: No visibility into whether the cron job executed or what happened.
   - **Fix**: Added comprehensive logging to track:
     - When the cron executes
     - What date it's checking
     - How many events/tasks found
     - How many profiles with phone numbers
     - App settings status
     - Success/failure of notifications

3. **No Diagnostic Tools**
   - **Problem**: Hard to debug why notifications weren't sent.
   - **Fix**: Created `/api/notifications/diagnose` endpoint that shows:
     - Current date calculations
     - App settings status
     - Profiles with phone numbers
     - Events/tasks for today and tomorrow
     - Environment variable status
     - Recommendations

### How to Verify the Fix

1. **Check Vercel Deployment**
   - Ensure the latest code is deployed to production
   - Check that `vercel.json` is present with cron configuration

2. **Run Diagnostics**
   - Visit: `https://your-domain.com/test-notifications`
   - Click "🔍 Run Diagnostics"
   - Review the output to check:
     - App settings (notifications enabled?)
     - Profiles (phone numbers present?)
     - Events/Tasks (found for tomorrow?)
     - Environment variables (Twilio configured?)

3. **Check Vercel Cron Logs**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Go to "Functions" tab
   - Look for `/api/notifications/reminders` function logs
   - Check for execution logs at 9:00 AM UTC daily

4. **Test Reminders Endpoint Manually**
   - Visit: `https://your-domain.com/test-notifications`
   - Click "Test Reminders Endpoint"
   - This simulates what the cron job does
   - Check the response for any errors

### Cron Schedule

- **Schedule**: `0 9 * * *` (9:00 AM UTC daily)
- **What it does**: Checks for events/tasks due "tomorrow" (relative to UTC time)
- **Example**: On Jan 14th at 9:00 AM UTC, it looks for events/tasks dated Jan 15th

### Important Notes

1. **Timezone**: The cron uses UTC time. If you're in a different timezone:
   - Events created in your local timezone are stored as DATE (no timezone)
   - The cron calculates "tomorrow" based on UTC
   - Make sure event/task dates match UTC expectations

2. **App-Level Settings**: If `notifications_enabled` is `false` in `app_settings`, no notifications will be sent, even if individual users have notifications enabled.

3. **Phone Numbers**: Users must have:
   - `phone_number` set in their profile
   - `notifications_enabled` not set to `false`
   - Phone number in E.164 format (e.g., `+1234567890`)

4. **Rate Limits**: If Twilio rate limit is hit, notifications are automatically disabled at the app level. Check the Settings page to re-enable.

### Next Steps

1. **Deploy the fixes** to Vercel
2. **Run diagnostics** to verify configuration
3. **Check Vercel logs** after the next cron execution (9:00 AM UTC)
4. **Monitor** for the next scheduled notification

### Files Modified

- `app/api/notifications/reminders/route.ts` - Fixed authentication, added logging
- `app/api/notifications/diagnose/route.ts` - New diagnostic endpoint
- `app/test-notifications/page.tsx` - Added diagnostics button

### Verification Checklist

- [ ] Latest code deployed to Vercel
- [ ] `vercel.json` present with cron configuration
- [ ] Environment variables set in Vercel (Twilio credentials)
- [ ] App settings: `notifications_enabled = true`
- [ ] At least one profile has phone number
- [ ] Events/tasks exist for tomorrow's date
- [ ] Vercel Cron is executing (check logs)
- [ ] No rate limit errors in logs


