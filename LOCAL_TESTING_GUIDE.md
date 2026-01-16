# Local Testing Guide for Notifications

## ✅ What You Have
- Supabase database with all tables ✅
- Vercel has environment variables ✅
- Code running locally ✅

## ⚠️ Important Notes

1. **Cron jobs don't run locally** - They only run on Vercel
2. **You can manually trigger notifications** - Test the endpoints directly
3. **Environment variables needed locally** - Copy from Vercel to `.env.local`

---

## Step 1: Create `.env.local` File

Create a `.env.local` file in your project root with these variables:

```env
# Supabase (you probably already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio (copy from Vercel or get from Twilio Console)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_SMS_FROM=+1234567890
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
CRON_SECRET=your_random_secret (optional)
```

**How to get Vercel environment variables:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Copy each value
3. Paste into `.env.local`

---

## Step 2: Restart Your Local Server

After creating/updating `.env.local`:

```bash
# Stop your current dev server (Ctrl+C)
# Then restart it
npm run dev
```

**Important:** Next.js only reads `.env.local` on server start. You must restart!

---

## Step 3: Test the Settings Page

1. Open your browser: `http://localhost:3000`
2. Navigate to `/settings`
3. Verify you can see and toggle notification settings
4. Save and verify it works

---

## Step 4: Test Manual Notification Sending

### Option A: Using Browser (Easiest)

1. **Create a test event/task with date = tomorrow**
   - Go to Calendar or Tasks page
   - Create an event/task with date = tomorrow
   - Note the item details

2. **Manually trigger reminders endpoint:**
   - Open browser console (F12)
   - Or use a tool like Postman/Insomnia
   - Or use the curl command below

### Option B: Using curl (Terminal)

**Test the reminders endpoint:**
```bash
# Without authentication (if CRON_SECRET not set)
curl http://localhost:3000/api/notifications/reminders

# With authentication (if CRON_SECRET is set)
curl -H "Authorization: Bearer your_cron_secret" http://localhost:3000/api/notifications/reminders
```

**Test manual notification send:**
```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Cookie: your_auth_cookie" \
  -d '{
    "type": "event",
    "itemId": "test-id-123",
    "itemTitle": "Test Event",
    "itemDate": "2024-12-25",
    "itemTime": "10:00",
    "creatorName": "Test User"
  }'
```

**Note:** For the POST request, you need to be authenticated. The easiest way is to:
1. Log in to your app in the browser
2. Open browser DevTools → Network tab
3. Make a request from the app (like creating an event)
4. Copy the `Cookie` header from that request
5. Use it in your curl command

---

## Step 5: Test via Browser Console

Open browser console (F12) on your app page and run:

```javascript
// Test reminders endpoint
fetch('http://localhost:3000/api/notifications/reminders')
  .then(res => res.json())
  .then(data => console.log('Reminders result:', data))
  .catch(err => console.error('Error:', err));

// Test manual send (you need to be logged in)
fetch('http://localhost:3000/api/notifications/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies for auth
  body: JSON.stringify({
    type: 'event',
    itemId: 'test-id',
    itemTitle: 'Test Event',
    itemDate: '2024-12-25',
    itemTime: '10:00',
    creatorName: 'Test User'
  })
})
  .then(res => res.json())
  .then(data => console.log('Send result:', data))
  .catch(err => console.error('Error:', err));
```

---

## Step 6: Verify Notifications Are Sent

1. **Check Twilio Console:**
   - Go to Twilio Console → Monitor → Logs
   - Look for sent messages
   - Check for any errors

2. **Check your phone:**
   - WhatsApp messages should arrive
   - SMS messages should arrive

3. **Check API response:**
   - The API will return success/error details
   - Look for `success: true` and message counts

---

## Common Issues & Solutions

### Issue: "Twilio credentials not configured"
**Solution:** Make sure `.env.local` has all Twilio variables and you restarted the server.

### Issue: "Unauthorized" error
**Solution:** Make sure you're logged in when testing the `/send` endpoint.

### Issue: No notifications sent
**Check:**
1. Phone numbers are in correct format (`+1234567890`)
2. App-level notifications enabled (Settings page)
3. User-level notifications enabled (Profile settings)
4. Twilio account has credits
5. WhatsApp sandbox is set up (if using sandbox)

### Issue: Cron job not running
**Solution:** This is expected! Cron jobs only run on Vercel. Test manually using the methods above.

---

## Quick Test Checklist

- [ ] `.env.local` file created with all variables
- [ ] Dev server restarted after adding `.env.local`
- [ ] Settings page accessible and working
- [ ] Phone numbers added to user profiles
- [ ] Test event/task created with date = tomorrow
- [ ] Reminders endpoint tested manually
- [ ] Notifications received on phone
- [ ] Twilio logs checked

---

## What Works Locally vs Production

| Feature | Local | Production (Vercel) |
|---------|-------|---------------------|
| Settings page | ✅ Yes | ✅ Yes |
| Profile phone numbers | ✅ Yes | ✅ Yes |
| Manual notification send | ✅ Yes | ✅ Yes |
| Reminders endpoint | ✅ Yes (manual) | ✅ Yes (automatic) |
| Cron job (automatic) | ❌ No | ✅ Yes (daily at 9 AM UTC) |

---

## Next Steps After Local Testing

Once you've tested locally and everything works:

1. **Commit and push your code** to your repository
2. **Deploy to Vercel** (automatic if connected to Git, or manual deploy)
3. **Verify environment variables** are set in Vercel
4. **Test on production** - Cron job will run automatically

---

## Summary

✅ **You CAN test notifications locally!**
- Create `.env.local` with Twilio credentials
- Restart dev server
- Manually trigger the reminders endpoint
- Cron jobs won't run automatically, but you can test everything else

The notifications **WILL work locally** once you have the environment variables set up! 🎉



