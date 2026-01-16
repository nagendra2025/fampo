# How to Check Twilio Console Logs for WhatsApp Errors

## Step-by-Step Guide

### Step 1: Navigate to Messaging Logs
1. Go to: https://console.twilio.com/
2. In the left sidebar, click **"Messaging"**
3. Click **"Logs"** (or "Try it out" → "Logs")

**OR**

1. Direct URL: https://console.twilio.com/us1/monitor/logs/messaging

### Step 2: Filter for WhatsApp Messages
1. In the Logs page, you'll see filters at the top
2. Look for:
   - **"Message Type"** filter → Select "WhatsApp"
   - **"Date Range"** → Select "Last 24 hours" or your test time
3. Click **"Apply Filters"**

### Step 3: Find Your Messages
1. You'll see a list of all messages
2. Look for messages with:
   - **From**: Your `TWILIO_WHATSAPP_FROM` number (e.g., `whatsapp:+14155238886`)
   - **To**: Your phone numbers (e.g., `whatsapp:+1234567890`)
   - **Status**: Check this column (queued, sent, delivered, failed)

### Step 4: Check Message Details
1. Click on a specific message to see details
2. Look for:
   - **Status**: What happened to the message
   - **Error Code**: If failed, what error code
   - **Error Message**: Description of the error
   - **Direction**: "outbound-api" (messages you sent)

---

## Common WhatsApp Error Codes in Logs

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `21608` | Number not registered in WhatsApp | Recipient needs to join sandbox |
| `21610` | Unsubscribed recipient | Recipient opted out |
| `21614` | Invalid WhatsApp number | Check phone number format |
| `63038` | Daily message limit exceeded | Wait for limit reset |
| `21211` | Invalid 'To' Phone Number | Check phone number format |

---

## What to Look For

### ✅ Successful Message
- **Status**: `delivered`
- **Error Code**: None
- **Error Message**: None

### ⚠️ Queued but Not Delivered
- **Status**: `queued` or `sent`
- **Error Code**: None (yet)
- **Note**: Message accepted but may fail later

### ❌ Failed Message
- **Status**: `failed`
- **Error Code**: See table above
- **Error Message**: Description of failure

---

## How to Fix Common Issues

### Issue 1: Error 21608 - Number Not Registered
**Problem**: Recipient hasn't joined WhatsApp sandbox

**Solution**:
1. Recipient sends WhatsApp message to: `+1 415 523 8886` (or your Twilio WhatsApp number)
2. They receive a join code (e.g., "join abc-xyz")
3. They reply with the join code
4. Once joined, they can receive messages

### Issue 2: Error 21614 - Invalid WhatsApp Number
**Problem**: Phone number format is incorrect

**Solution**:
- Ensure phone numbers are in E.164 format: `+1234567890`
- Include country code
- No spaces or dashes

### Issue 3: Error 21610 - Unsubscribed
**Problem**: Recipient opted out

**Solution**:
- Recipient needs to opt back in
- Send a message to your Twilio WhatsApp number
- Follow the opt-in process

---

## Alternative: Check via API

You can also check logs programmatically, but the Console is easier for debugging.

---

## Quick Checklist

- [ ] Go to Twilio Console → Messaging → Logs
- [ ] Filter for "WhatsApp" messages
- [ ] Check message status (delivered, failed, queued)
- [ ] If failed, note the error code
- [ ] Check error message for details
- [ ] Fix based on error code (see table above)

---

## Next Steps After Finding Error

1. **Note the error code** from the logs
2. **Check the error message** for details
3. **Apply the fix** based on the error code (see table)
4. **Test again** after fixing
5. **Verify** in logs that message is now delivered


