import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  sendNotificationToUser,
  formatTaskReminderMessage,
  formatEventReminderMessage,
} from "@/lib/services/notifications";

// Send notifications to all family members
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, itemId, itemTitle, itemDate, itemTime, creatorName } = body;

    if (!type || !itemId || !itemTitle || !itemDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get app-level settings
    const { data: appSettings } = await supabase
      .from("app_settings")
      .select("id, notifications_enabled, enable_sms")
      .limit(1)
      .single();

    // Check app-level notifications first
    if (appSettings && !appSettings.notifications_enabled) {
      return NextResponse.json({
        success: false,
        message: "Notifications are disabled at application level",
      });
    }

    // Get all family members with phone numbers and notification preferences
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, phone_number, notifications_enabled, sms_enabled")
      .not("phone_number", "is", null);

    if (profilesError) {
      return NextResponse.json(
        { error: profilesError.message },
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json(
        { message: "No family members with phone numbers found" },
        { status: 200 }
      );
    }

    // Deduplicate profiles by phone number to avoid sending duplicate notifications
    // If multiple profiles have the same phone number, only send to the first one
    const uniqueProfilesByPhone = new Map<string, typeof profiles[0]>();
    for (const profile of profiles) {
      if (profile.phone_number && !uniqueProfilesByPhone.has(profile.phone_number)) {
        uniqueProfilesByPhone.set(profile.phone_number, profile);
      }
    }
    const deduplicatedProfiles = Array.from(uniqueProfilesByPhone.values());

    // Format message based on type
    let message = "";
    if (type === "task") {
      message = formatTaskReminderMessage(itemTitle, itemDate, creatorName);
    } else if (type === "event") {
      message = formatEventReminderMessage(
        itemTitle,
        itemDate,
        itemTime || null,
        creatorName
      );
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Send notifications to all family members (deduplicated by phone number)
    const results = [];
    let rateLimitDetected = false;
    
    for (const profile of deduplicatedProfiles) {
      if (
        profile.phone_number &&
        profile.notifications_enabled !== false
      ) {
        const result = await sendNotificationToUser(
          profile.phone_number,
          profile.notifications_enabled ?? true,
          false, // WhatsApp disabled
          profile.sms_enabled ?? true,
          message,
          appSettings || null
        );
        
        // Track if rate limit was detected
        if (result.rateLimited) {
          rateLimitDetected = true;
        }
        
        results.push({
          profileId: profile.id,
          name: profile.name,
          sms: result.sms,
          errors: result.errors,
          smsDetails: result.smsDetails,
        });
      }
    }

    // Auto-disable notifications if rate limit was detected
    if (rateLimitDetected && appSettings) {
      await supabase
        .from("app_settings")
        .update({ notifications_enabled: false })
        .eq("id", appSettings.id);
    }

    const response: any = {
      success: true,
      sent: results.filter((r) => r.sms).length,
      total: deduplicatedProfiles.length,
      results,
    };

    if (rateLimitDetected) {
      response.rateLimitExceeded = true;
      response.message = "Twilio daily message limit exceeded. Notifications have been automatically disabled. They will need to be manually re-enabled after the limit resets (typically at midnight).";
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Notification send error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send notifications" },
      { status: 500 }
    );
  }
}

