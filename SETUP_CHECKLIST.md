# Notification Setup - Next Steps Checklist

## ✅ Completed
- [x] Database migrations run (009 and 010)
- [x] All columns and tables exist
- [x] Code files in place

## 📋 Next Steps

### Step 1: Add Phone Numbers to User Profiles

**Option A: Via UI (Recommended)**
1. Go to your app → Family page (`/family`)
2. Click "Edit" on each family member's profile
3. Enter phone number in E.164 format: `+1234567890`
4. Configure notification preferences (WhatsApp/SMS)
5. Click "Save Changes"

**Option B: Via Supabase Dashboard**
1. Go to Supabase → Table Editor → `profiles`
2. Edit each user row
3. Add phone number to `phone_number` column (format: `+1234567890`)
4. Save

**Phone Number Format:**
- Must start with `+` and country code
- Examples: `+1234567890` (US), `+447911123456` (UK), `+919876543210` (India)

---

### Step 2: Verify App Settings

1. Go to your app → Settings page (`/settings`)
2. Verify the settings are visible:
   - ✅ Enable Notifications (master switch)
   - ✅ Enable SMS Notifications
   - ✅ Enable WhatsApp Notifications
3. All should be enabled by default

---

### Step 3: Set Up Twilio (If Not Done)

1. **Create Twilio Account**
   - Go to [twilio.com](https://www.twilio.com)
   - Sign up for free account
   - Verify your email and phone

2. **Get Credentials**
   - Account SID (from Twilio Console)
   - Auth Token (from Twilio Console)
   - Phone number for SMS (buy a number or use trial)
   - WhatsApp number: `whatsapp:+14155238886` (sandbox)

3. **Set Up WhatsApp Sandbox** (for testing)
   - Go to Twilio Console → Messaging → Try it out
   - Send "join [code]" to the sandbox number
   - Follow instructions

---

### Step 4: Add Environment Variables

**For Local Development (.env.local):**
```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_SMS_FROM=+1234567890
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
CRON_SECRET=your_random_secret (optional)
```

**For Production (Vercel):**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all the variables above
3. Redeploy your application

---

### Step 5: Test the Setup

**Test 1: Settings Page**
- Navigate to `/settings`
- Toggle notification settings
- Verify changes save successfully

**Test 2: Profile Phone Numbers**
- Go to Family page
- Edit profile and add phone number
- Verify phone number saves

**Test 3: Notification Sending (After Twilio Setup)**
- Create a test event with date = tomorrow
- Wait for cron job to run (or trigger manually)
- Check if notifications are sent

**Test 4: Manual Notification (Optional)**
```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event",
    "itemId": "test-id",
    "itemTitle": "Test Event",
    "itemDate": "2024-12-25",
    "itemTime": "10:00",
    "creatorName": "Test User"
  }'
```

---

### Step 6: Verify Cron Job (Production)

**If using Vercel:**
- The `vercel.json` file is already configured
- Cron job will run automatically at 9 AM UTC daily
- Check Vercel logs to verify execution

**If using external cron service:**
- Set up daily HTTP request to: `https://your-domain.com/api/notifications/reminders`
- Include `Authorization: Bearer your_cron_secret` header if CRON_SECRET is set

---

## 🎯 Priority Order

1. **Add phone numbers** to user profiles (via UI or Supabase)
2. **Test Settings page** to ensure it works
3. **Set up Twilio** account and get credentials
4. **Add environment variables** (local and production)
5. **Test notifications** with a test event/task

---

## ⚠️ Important Notes

- Phone numbers must be in E.164 format (`+1234567890`)
- Notifications only send if:
  - App-level notifications are enabled (Settings page)
  - User-level notifications are enabled (Profile settings)
  - User has a phone number
- Cron job runs daily at 9 AM UTC (check `vercel.json` for schedule)
- For testing, you can manually trigger the reminders endpoint

---

## 🐛 Troubleshooting

**Notifications not sending?**
- Check Twilio credentials are correct
- Verify phone numbers are in correct format
- Check app-level and user-level settings are enabled
- Check Twilio logs in Twilio Console

**Settings page not working?**
- Verify `app_settings` table has one row
- Check browser console for errors
- Verify API route `/api/settings` is accessible

**Phone numbers not saving?**
- Verify `phone_number` column exists in `profiles` table
- Check phone number format (must start with `+`)
- Check browser console for errors

---

## ✅ Completion Checklist

- [ ] Phone numbers added to all user profiles
- [ ] Settings page tested and working
- [ ] Twilio account created and configured
- [ ] Environment variables added (local and production)
- [ ] Test notification sent successfully
- [ ] Cron job verified (for production)

---

Once all steps are complete, your notification system will be fully operational! 🎉



