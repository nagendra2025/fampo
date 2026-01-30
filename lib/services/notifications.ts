import twilio from "twilio";

// Initialize Twilio client
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }

  return twilio(accountSid, authToken);
};

// Check if error is a rate limit error
export function isRateLimitError(error: any): boolean {
  return (
    error?.status === 429 &&
    (error?.code === 63038 || error?.message?.includes("daily messages limit"))
  );
}


// Send SMS message
export async function sendSMSMessage(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string; rateLimited?: boolean }> {
  try {
    const client = getTwilioClient();
    const from = process.env.TWILIO_SMS_FROM;

    if (!from) {
      throw new Error("TWILIO_SMS_FROM not configured");
    }

    await client.messages.create({
      body: message,
      from: from,
      to: to,
    });

    return { success: true };
  } catch (error: any) {
    console.error("SMS send error:", error);
    const isRateLimit = isRateLimitError(error);
    return {
      success: false,
      error: error.message || "Failed to send SMS message",
      rateLimited: isRateLimit,
    };
  }
}

// App-level settings interface
export interface AppSettings {
  notifications_enabled: boolean;
  enable_sms: boolean;
}

// Send notification to a user (respects both app-level and user-level preferences)
export async function sendNotificationToUser(
  phoneNumber: string | null,
  userNotificationsEnabled: boolean,
  userWhatsappEnabled: boolean, // Kept for backward compatibility but ignored
  userSmsEnabled: boolean,
  message: string,
  appSettings?: AppSettings | null
): Promise<{ whatsapp: boolean; sms: boolean; errors: string[]; rateLimited: boolean; whatsappDetails?: any; smsDetails?: any }> {
  const results = {
    whatsapp: false,
    sms: false,
    errors: [] as string[],
    rateLimited: false,
    whatsappDetails: undefined as any,
    smsDetails: undefined as any,
  };

  // Check app-level settings first (if provided)
  if (appSettings) {
    if (!appSettings.notifications_enabled) {
      // App-level notifications are disabled
      return results;
    }
  }

  // Check user-level settings
  if (!phoneNumber || !userNotificationsEnabled) {
    return results;
  }

  // Send SMS if enabled at both app and user level
  if (userSmsEnabled && (!appSettings || appSettings.enable_sms)) {
    const smsResult = await sendSMSMessage(phoneNumber, message);
    results.smsDetails = smsResult;
    if (smsResult.success) {
      results.sms = true;
    } else {
      if (smsResult.rateLimited) {
        results.rateLimited = true;
        results.errors.push(`SMS: Rate limit exceeded - daily message limit reached`);
      } else {
        results.errors.push(`SMS: ${smsResult.error}`);
      }
    }
  }

  return results;
}

// Format task reminder message
export function formatTaskReminderMessage(
  taskTitle: string,
  dueDate: string,
  creatorName: string | null
): string {
  const creator = creatorName ? ` (from ${creatorName})` : "";
  return `📋 Reminder: Task "${taskTitle}" is due tomorrow${creator}. Due: ${dueDate}`;
}

// Format event reminder message
export function formatEventReminderMessage(
  eventTitle: string,
  eventDate: string,
  eventTime: string | null,
  creatorName: string | null
): string {
  const creator = creatorName ? ` (from ${creatorName})` : "";
  const timeStr = eventTime ? ` at ${eventTime}` : "";
  return `📅 Reminder: Event "${eventTitle}" is tomorrow${timeStr}${creator}. Date: ${eventDate}`;
}

