# WhatsApp Notification Troubleshooting

## Issue: WhatsApp Notifications Not Received

### Problem
- API returns `"whatsapp": true` (success)
- But no WhatsApp messages are actually received
- SMS notifications work fine

### Common Causes

#### 1. Twilio WhatsApp Sandbox Restrictions
**Most Common Issue**: Twilio WhatsApp uses a sandbox for testing. Recipients must join the sandbox first.

**How to Check:**
- Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
- Check if your phone number is registered in the sandbox

**Solution:**
1. Send a WhatsApp message to your Twilio WhatsApp number (from `TWILIO_WHATSAPP_FROM`)
2. Send the join code (e.g., "join [code]")
3. Once joined, you can receive messages

**Note**: In production, you need to register your WhatsApp Business number with Twilio.

#### 2. Phone Number Format
**Check**: Phone numbers must be in E.164 format with `whatsapp:` prefix

**Correct Format:**
- `whatsapp:+1234567890` ✅
- `+1234567890` ✅ (code adds prefix automatically)
- `1234567890` ❌ (missing country code)
- `whatsapp:1234567890` ❌ (missing country code)

#### 3. Twilio Response Status
**Issue**: Twilio might return "queued" status, but message fails later

**Check**: Look at the detailed error in the response:
```json
{
  "whatsappDetails": {
    "twilioError": {
      "code": "21608",
      "message": "The number is not registered in WhatsApp",
      "status": "failed"
    }
  }
}
```

#### 4. Twilio WhatsApp Configuration
**Check**: Verify `TWILIO_WHATSAPP_FROM` is correct

**Format**: Should be `whatsapp:+14155238886` (Twilio sandbox number)
- Or your registered WhatsApp Business number

---

## How to Debug

### Step 1: Check Server Logs
Look for detailed WhatsApp logs:
```
[WhatsApp] Attempting to send to: whatsapp:+1234567890, from: whatsapp:+14155238886
[WhatsApp] Twilio response: { sid: "...", status: "queued", ... }
```

### Step 2: Check API Response
After clicking "Test Manual Notification Send", look for:
```json
{
  "results": [
    {
      "name": "Nag",
      "whatsapp": true,  // This might be true even if not delivered
      "whatsappDetails": {
        "twilioError": {
          "code": "...",
          "message": "...",
          "status": "..."
        }
      }
    }
  ]
}
```

### Step 3: Check Twilio Console
1. Go to Twilio Console → Messaging → Logs
2. Look for your WhatsApp messages
3. Check the status:
   - `queued` = Message is queued (might still fail)
   - `sent` = Message sent to Twilio
   - `delivered` = Message delivered to recipient
   - `failed` = Message failed (check error code)

---

## Common Twilio Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `21608` | Number not registered in WhatsApp | Join Twilio WhatsApp sandbox |
| `21610` | Unsubscribed recipient | Recipient needs to opt-in |
| `21614` | Invalid WhatsApp number | Check phone number format |
| `63038` | Daily message limit exceeded | Wait for limit reset |

---

## Solutions

### Solution 1: Join Twilio WhatsApp Sandbox
1. Send a WhatsApp message to your Twilio WhatsApp number
2. You'll receive a join code
3. Reply with the join code
4. Once joined, you can receive messages

### Solution 2: Check Phone Number Format
Ensure phone numbers in profiles are:
- E.164 format: `+1234567890`
- Include country code
- No spaces or dashes

### Solution 3: Check Twilio Console
1. Go to Twilio Console → Messaging → Logs
2. Find your WhatsApp messages
3. Check status and error messages
4. Look for delivery issues

### Solution 4: Test with Twilio Console
1. Go to Twilio Console → Messaging → Try it out
2. Send a test WhatsApp message manually
3. Check if it's received
4. This helps isolate if it's a code issue or Twilio configuration issue

---

## Updated Code Features

The code now includes:
- ✅ Detailed Twilio error logging
- ✅ Response status checking
- ✅ Error details in API response
- ✅ Better debugging information

**Next Steps:**
1. Test again with "Test Manual Notification Send"
2. Check the `whatsappDetails` in the response
3. Look for `twilioError` to see actual Twilio error
4. Check server logs for detailed information

---

## Production Setup

For production, you need:
1. **WhatsApp Business Account** registered with Twilio
2. **Approved WhatsApp Business Number**
3. **Phone numbers opted-in** to receive messages
4. **Proper E.164 format** for all phone numbers

Sandbox is only for testing and has limitations.


