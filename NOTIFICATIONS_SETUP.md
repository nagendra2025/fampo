# WhatsApp & SMS Notifications Setup Guide

This guide explains how to set up WhatsApp and SMS notifications for the Rasna family dashboard using Twilio.

## Overview

The notification system sends reminders to all family members 1 day before:
- **Events** (from calendar)
- **Tasks** (from to-do list)

Notifications are sent via:
- **WhatsApp** (if enabled)
- **SMS** (if enabled)

Each family member can configure their notification preferences in their profile settings.

---

## Step 1: Set Up Twilio Account

1. **Create a Twilio Account**
   - Go to [twilio.com](https://www.twilio.com)
   - Sign up for a free account (includes trial credits)
   - Verify your email and phone number

2. **Get Your Twilio Credentials**
   - Go to Twilio Console → Account → API Keys & Tokens
   - Copy your **Account SID** and **Auth Token**

3. **Get a Phone Number for SMS**
   - Go to Phone Numbers → Buy a Number
   - Select a number (or use the trial number provided)
   - Copy the phone number (format: +1234567890)

4. **Set Up WhatsApp (Optional but Recommended)**
   - Go to Messaging → Try it out → Send a WhatsApp message
   - Use the Twilio Sandbox number: `whatsapp:+14155238886`
   - Follow instructions to join the sandbox (send "join [code]" to the number)
   - For production, you'll need to apply for WhatsApp Business API access

---

## Step 2: Configure Environment Variables

Add these variables to your `.env.local` file (for local development) and Vercel environment variables (for production):

```env
# Twilio Credentials
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here

# Twilio Phone Numbers
TWILIO_SMS_FROM=+1234567890
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Optional: Cron Secret (for securing the reminders endpoint)
CRON_SECRET=your_random_secret_here
```

### For Production (Vercel):

1. Go to your Vercel project → Settings → Environment Variables
2. Add all the variables above
3. Redeploy your application

---

## Step 3: Run Database Migration

Run the migration to add phone number and notification fields to the profiles table:

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration file:
   ```
   supabase/migrations/009_add_notifications.sql
   ```

This adds:
- `phone_number` (TEXT, nullable)
- `notifications_enabled` (BOOLEAN, default: true)
- `whatsapp_enabled` (BOOLEAN, default: true)
- `sms_enabled` (BOOLEAN, default: true)

---

## Step 4: Set Up Cron Job for Reminders

The reminders endpoint (`/api/notifications/reminders`) needs to be called daily to check for events/tasks due tomorrow.

### Option A: Vercel Cron (Recommended)

1. Create `vercel.json` in your project root (if it doesn't exist):

```json
{
  "crons": [
    {
      "path": "/api/notifications/reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This runs daily at 9:00 AM UTC. Adjust the schedule as needed using [cron syntax](https://crontab.guru/).

2. If you set `CRON_SECRET`, update the cron to include authentication:

```json
{
  "crons": [
    {
      "path": "/api/notifications/reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Then update `app/api/notifications/reminders/route.ts` to check for the secret in headers.

### Option B: External Cron Service

Use services like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [Cronitor](https://cronitor.io)

Set up a daily HTTP request to:
```
GET https://your-domain.com/api/notifications/reminders
```

If you set `CRON_SECRET`, include it in the Authorization header:
```
Authorization: Bearer your_cron_secret_here
```

---

## Step 5: Add Phone Numbers to User Profiles

1. Users can add their phone number in the profile edit form:
   - Go to Family page
   - Click "Edit" on their profile
   - Enter phone number in E.164 format: `+1234567890`
   - Configure notification preferences

2. **Phone Number Format:**
   - Must start with `+` followed by country code
   - Example: `+1234567890` (US), `+447911123456` (UK)

---

## Step 6: Test the Setup

### Test 1: Manual Notification Send

You can test sending notifications manually using the API:

```bash
curl -X POST https://your-domain.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event",
    "itemId": "event-id",
    "itemTitle": "Test Event",
    "itemDate": "2024-12-25",
    "itemTime": "10:00",
    "creatorName": "John"
  }'
```

### Test 2: Reminders Endpoint

Test the reminders endpoint:

```bash
curl https://your-domain.com/api/notifications/reminders
```

Or with authentication (if CRON_SECRET is set):

```bash
curl -H "Authorization: Bearer your_cron_secret_here" \
  https://your-domain.com/api/notifications/reminders
```

### Test 3: Create Test Event/Task

1. Create an event or task with date = tomorrow
2. Wait for the cron job to run (or trigger it manually)
3. Check that notifications were sent

---

## How It Works

### Notification Flow

1. **Daily Cron Job** runs at scheduled time (e.g., 9 AM)
2. **Reminders Endpoint** (`/api/notifications/reminders`):
   - Queries events/tasks due tomorrow
   - Gets all family members with phone numbers
   - Sends WhatsApp/SMS based on user preferences
3. **Messages** are formatted with:
   - Task/Event title
   - Due date
   - Creator name (if available)

### User Preferences

Each user can control:
- **Enable/Disable Notifications** (master switch)
- **WhatsApp Notifications** (on/off)
- **SMS Notifications** (on/off)

These are set in the profile edit form.

---

## Troubleshooting

### Notifications Not Sending

1. **Check Twilio Credentials:**
   - Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are correct
   - Check Twilio Console for account status

2. **Check Phone Numbers:**
   - Ensure phone numbers are in E.164 format (`+1234567890`)
   - Verify users have phone numbers in their profiles
   - Check notification preferences are enabled

3. **Check Twilio Logs:**
   - Go to Twilio Console → Monitor → Logs
   - Look for error messages

4. **Check Cron Job:**
   - Verify cron job is running
   - Check Vercel logs for cron execution
   - Test the endpoint manually

### Common Errors

- **"Twilio credentials not configured"**: Missing environment variables
- **"TWILIO_WHATSAPP_FROM not configured"**: Missing WhatsApp from number
- **"Failed to send WhatsApp message"**: Check Twilio account status, phone number format, or WhatsApp sandbox setup

---

## Cost Considerations

### Twilio Pricing (as of 2024)

- **SMS**: ~$0.0075 per message (US)
- **WhatsApp**: ~$0.005-0.01 per message (varies by country)

### Example Monthly Cost

For a family of 4 with daily reminders:
- 4 family members × 2 notifications/day (event + task) = 8 messages/day
- 8 messages × 30 days = 240 messages/month
- Cost: ~$1.80-2.40/month (if all via WhatsApp)

**Note:** Twilio offers free trial credits for testing.

---

## Production Checklist

- [ ] Twilio account created and verified
- [ ] Environment variables set in Vercel
- [ ] Database migration run
- [ ] Cron job configured (Vercel Cron or external)
- [ ] Phone numbers added to user profiles
- [ ] Notification preferences configured
- [ ] Test notifications sent successfully
- [ ] Monitor Twilio usage and costs

---

## Next Steps

- Consider adding immediate notifications on create/update (currently only scheduled reminders)
- Add notification history/logging
- Support for multiple languages in messages
- Rich media messages (images, links)

---

## Support

For issues or questions:
- Check Twilio documentation: [twilio.com/docs](https://www.twilio.com/docs)
- Review application logs in Vercel
- Check Supabase logs for database errors



