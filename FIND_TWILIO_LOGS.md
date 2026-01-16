# How to Find Twilio Message Logs

## You're Currently On: Log Archives (Wrong Page)
- This is for **bulk exports** of historical data
- **NOT** for viewing individual message statuses

## Correct Location: Message Logs

### Option 1: Via Monitor Section (Easiest)
1. In the **left sidebar**, look for **"Monitor"** (usually near the bottom)
2. Click **"Monitor"** to expand
3. Click **"Logs"**
4. Click **"Messaging"**

**Direct Path**: Monitor → Logs → Messaging

### Option 2: Direct URL
Go directly to:
```
https://console.twilio.com/us1/monitor/logs/messaging
```

### Option 3: Via Messaging Section
1. In the **left sidebar**, click **"Messaging"**
2. Look for **"Try it out"** or **"Logs"** option
3. Some accounts have logs directly under Messaging

---

## What You'll See on the Logs Page

### Message List
- **Table** with columns:
  - **SID** (Message ID)
  - **From** (Sender number)
  - **To** (Recipient number)
  - **Status** (delivered, failed, queued, sent)
  - **Date/Time**
  - **Type** (SMS, WhatsApp, etc.)

### Filters
- **Message Type**: Filter for "WhatsApp"
- **Date Range**: Select time period
- **Status**: Filter by status (failed, delivered, etc.)

### Message Details
- Click on any message to see:
  - Full error details
  - Error code
  - Error message
  - Delivery status

---

## Visual Guide

### Left Sidebar Navigation:
```
Twilio Home
├── Messaging (you're here)
│   ├── Overview
│   ├── Try it out
│   ├── Settings
│   │   └── Log archives ← You're here (WRONG)
│   └── ...
│
└── Monitor ← Go here instead
    └── Logs
        └── Messaging ← This is what you need!
```

---

## Quick Steps

1. **Look for "Monitor"** in left sidebar (scroll down if needed)
2. **Click "Monitor"**
3. **Click "Logs"**
4. **Click "Messaging"**
5. **Filter for "WhatsApp"** messages
6. **Check the "Status"** column for failed messages
7. **Click a failed message** to see error code

---

## Alternative: Search

1. Use the **search bar** at the top
2. Type: **"logs messaging"**
3. Select the result that says "Logs" or "Messaging Logs"

---

## If You Still Can't Find It

### Check Your Twilio Account Type
- **Trial accounts** may have limited access
- Some features require **upgraded accounts**

### Try These URLs Directly:
- US Region: `https://console.twilio.com/us1/monitor/logs/messaging`
- EU Region: `https://console.twilio.com/eu1/monitor/logs/messaging`
- Default: `https://console.twilio.com/monitor/logs/messaging`

---

## What to Do Once You Find It

1. **Filter** for WhatsApp messages
2. **Look for** messages with status "failed"
3. **Click** on a failed message
4. **Note** the error code (e.g., 21608, 21614)
5. **Check** the error message for details
6. **Apply fix** based on error code

---

## Summary

- ❌ **Wrong**: Log archives (Settings → Log archives)
- ✅ **Right**: Monitor → Logs → Messaging
- 🔗 **Direct**: https://console.twilio.com/us1/monitor/logs/messaging

The logs page shows individual messages with their statuses, which is what you need to debug WhatsApp delivery issues.


