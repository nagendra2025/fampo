# Good Morning Feature - Design Document

## Overview

**Feature Name**: Daily Good Morning Wishes  
**Purpose**: Keep WhatsApp 24-hour window open + send daily motivational messages  
**Channel**: WhatsApp only (no SMS)  
**Frequency**: Daily at 8:00 AM UTC  
**Target**: All family members with WhatsApp enabled

---

## Problem Statement

- WhatsApp Sandbox requires messages within 24 hours to keep window open
- Error 63016 occurs when trying to send outside the window
- Manual messaging required daily (inconvenient)
- Need automated solution to maintain window

---

## Solution

### Automated Daily Good Morning Messages
- Sends WhatsApp message daily at 8:00 AM UTC
- Includes unique motivational quote
- Keeps 24-hour window open automatically
- No manual intervention needed

---

## Architecture

### Components

1. **Cron Job** (`vercel.json`)
   - Schedule: `0 8 * * *` (8:00 AM UTC daily)
   - Endpoint: `/api/notifications/good-morning`

2. **API Endpoint** (`app/api/notifications/good-morning/route.ts`)
   - Fetches daily quote
   - Gets all family members with WhatsApp enabled
   - Sends WhatsApp messages
   - Handles errors gracefully

3. **Quote Service** (`lib/services/quotes.ts`)
   - Primary: OpenAI API
   - Fallback: Quotable API
   - Final fallback: Simple message

4. **Notification Service** (`lib/services/notifications.ts`)
   - Existing WhatsApp sending logic
   - Reused for good morning messages

---

## Data Flow

```
8:00 AM UTC - Cron Job Triggers
    ↓
/api/notifications/good-morning endpoint called
    ↓
Get daily quote (OpenAI → Quotable → Fallback)
    ↓
Get all family members with WhatsApp enabled
    ↓
For each family member:
    ↓
Format message: "🌅 Good Morning, [Name]!\n\n[Quote]\n\nHave a wonderful day! 💙"
    ↓
Send via WhatsApp (using existing notification service)
    ↓
Log results
```

---

## Quote Service Design

### Three-Tier Fallback System

#### Tier 1: OpenAI API (Primary)
- **Service**: OpenAI API
- **Prompt**: "Generate a short, motivational quote (1-2 sentences) suitable for a family good morning message. Make it uplifting and inspiring. Keep it under 150 characters."
- **Model**: `gpt-3.5-turbo` (cost-effective)
- **Cost**: ~$0.0001 per call
- **Benefits**: Unique quotes every day

#### Tier 2: Quotable API (Fallback)
- **Service**: Quotable API (free)
- **Endpoint**: `https://api.quotable.io/random?tags=motivational,inspirational&maxLength=150`
- **Method**: HTTP GET
- **Authentication**: None required
- **Benefits**: Free, reliable, good quotes

#### Tier 3: Simple Message (Final Fallback)
- **Message**: "Have a wonderful day filled with joy and positivity!"
- **Benefits**: Always works, no dependencies

---

## Message Format

### Template
```
🌅 Good Morning, [Family Member Name]!

[Daily Quote]

Have a wonderful day! 💙
```

### Example
```
🌅 Good Morning, Nag!

The only way to do great work is to love what you do.

Have a wonderful day! 💙
```

---

## API Endpoint Specification

### Endpoint
```
GET /api/notifications/good-morning
```

### Authentication
- Vercel Cron: No authentication needed (same as reminders endpoint)
- Manual access: Optional CRON_SECRET if set

### Response Format
```json
{
  "success": true,
  "executedAt": "2026-01-16 08:00:00 UTC",
  "quoteSource": "openai" | "quotable" | "fallback",
  "quote": "The quote text",
  "profilesFound": 5,
  "messagesSent": 5,
  "results": [
    {
      "profileId": "uuid",
      "name": "Nag",
      "whatsapp": true,
      "errors": []
    }
  ]
}
```

### Error Handling
- If quote service fails: Use fallback message
- If WhatsApp send fails: Log error, continue with others
- If all fail: Return error response

---

## Cron Job Configuration

### vercel.json
```json
{
  "crons": [
    {
      "path": "/api/notifications/reminders",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/notifications/good-morning",
      "schedule": "0 8 * * *"
    }
  ]
}
```

### Schedule
- **Good Morning**: 8:00 AM UTC (3:00 AM Eastern Time)
- **Reminders**: 9:00 AM UTC (4:00 AM Eastern Time)
- **Gap**: 1 hour between (ensures window is open)

---

## Environment Variables

### Required
- `TWILIO_ACCOUNT_SID` - Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Twilio Auth Token
- `TWILIO_WHATSAPP_FROM` - Twilio WhatsApp number
- `OPENAI_API_KEY` - OpenAI API key (for quotes)

### Optional
- `CRON_SECRET` - Optional cron authentication

---

## User Preferences (Future Enhancement)

### Database Schema
```sql
ALTER TABLE profiles
ADD COLUMN good_morning_enabled BOOLEAN DEFAULT true;
```

### Logic
- Check `good_morning_enabled` before sending
- Default: `true` (send to all)
- User can opt-out via profile settings

---

## Error Handling

### Quote Service Errors
1. **OpenAI fails**: Try Quotable API
2. **Quotable fails**: Use fallback message
3. **All fail**: Use simple message (always works)

### WhatsApp Send Errors
1. **Rate limit**: Log error, continue with others
2. **Invalid number**: Log error, skip user
3. **Network error**: Log error, continue
4. **All fail**: Return error response

### Logging
- Log all quote service attempts
- Log all WhatsApp send attempts
- Log errors with details
- Log success/failure counts

---

## Testing Strategy

### Unit Tests
- Quote service (all three tiers)
- Message formatting
- Error handling

### Integration Tests
- Full endpoint flow
- WhatsApp sending
- Error scenarios

### Manual Tests
- Test endpoint manually
- Verify quote generation
- Verify WhatsApp delivery
- Test fallback scenarios

---

## Monitoring

### Metrics to Track
- Quote service success rate (OpenAI vs Quotable vs Fallback)
- WhatsApp delivery success rate
- Error rates by type
- Execution time

### Logging
- All quote service calls
- All WhatsApp send attempts
- All errors with details
- Execution timestamps

---

## Cost Analysis

### OpenAI API
- **Per call**: ~$0.0001
- **Per day**: $0.0001
- **Per month**: ~$0.003
- **Per year**: ~$0.04

### Quotable API
- **Cost**: Free
- **Rate limits**: None (for our use)

### Twilio WhatsApp
- **Per message**: Same as existing notifications
- **5 messages/day**: 5 × existing rate
- **Additional cost**: Minimal (already using Twilio)

### Total Additional Cost
- **Monthly**: ~$0.01 (practically free)

---

## Security Considerations

### API Keys
- Store in environment variables
- Never commit to repository
- Rotate periodically

### Rate Limiting
- One execution per day (cron controlled)
- No user-triggered execution
- Protected by Vercel Cron

### Error Information
- Don't expose sensitive details in responses
- Log errors securely
- Handle failures gracefully

---

## Future Enhancements

### Phase 2: User Preferences
- Add `good_morning_enabled` to profiles
- UI toggle in profile settings
- Respect user choice

### Phase 3: Customization
- Allow users to choose quote categories
- Allow users to set preferred send time
- Allow users to customize message template

### Phase 4: Analytics
- Track quote popularity
- Track delivery success rates
- User engagement metrics

---

## Implementation Checklist

### Phase 1: Core Implementation
- [ ] Create quote service (`lib/services/quotes.ts`)
- [ ] Create good-morning endpoint (`app/api/notifications/good-morning/route.ts`)
- [ ] Update `vercel.json` with cron job
- [ ] Add environment variable documentation
- [ ] Test quote service (all tiers)
- [ ] Test endpoint manually
- [ ] Test WhatsApp delivery
- [ ] Test error scenarios

### Phase 2: Documentation
- [ ] Update README with new feature
- [ ] Document environment variables
- [ ] Document cron schedule
- [ ] Create troubleshooting guide

### Phase 3: Deployment
- [ ] Add `OPENAI_API_KEY` to Vercel
- [ ] Deploy to production
- [ ] Monitor first execution
- [ ] Verify WhatsApp delivery

---

## Success Criteria

### Functional
- ✅ Sends daily at 8:00 AM UTC
- ✅ Includes unique quote
- ✅ Sends to all family members
- ✅ WhatsApp only (no SMS)
- ✅ Keeps 24-hour window open

### Non-Functional
- ✅ Reliable (99%+ success rate)
- ✅ Fast execution (< 30 seconds)
- ✅ Graceful error handling
- ✅ Comprehensive logging

---

## Summary

**Feature**: Daily Good Morning Wishes  
**Purpose**: Keep WhatsApp window open + daily motivation  
**Implementation**: Cron job + API endpoint + Quote service  
**Timing**: 8:00 AM UTC daily  
**Cost**: ~$0.01/month  
**Status**: Ready for implementation

---

## Next Steps

1. ✅ Design document complete
2. ⏭️ Implement quote service
3. ⏭️ Implement API endpoint
4. ⏭️ Update cron configuration
5. ⏭️ Test and deploy

**Ready to implement!** 🚀


