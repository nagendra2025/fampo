import { createCronClient } from "@/lib/supabase/cron";
import { NextResponse } from "next/server";
import { sendNotificationToUser } from "@/lib/services/notifications";
import { getDailyQuote } from "@/lib/services/quotes";
import { format } from "date-fns";

/**
 * Good Morning Notifications Endpoint
 * 
 * Sends daily "Good Morning" messages with motivational quotes via SMS
 * Purpose: Daily motivation and family connection
 * 
 * Schedule: 8:00 AM UTC daily (via Vercel Cron)
 */

// Force dynamic execution - prevents caching and ensures cron jobs run every time
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Log immediately - even before try/catch to ensure we see if endpoint is called
  const now = new Date();
  console.log(`[Good Morning] ===== ENDPOINT CALLED ===== ${format(now, "yyyy-MM-dd HH:mm:ss")} UTC`);
  console.log(`[Good Morning] Request URL: ${request.url}`);
  console.log(`[Good Morning] Request headers:`, Object.fromEntries(request.headers.entries()));
  
  try {
    // Optional: Add API key authentication for cron jobs
    // Note: Vercel Cron doesn't send Authorization headers automatically
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    console.log(`[Good Morning] CRON_SECRET exists: ${!!cronSecret}`);
    console.log(`[Good Morning] Auth header exists: ${!!authHeader}`);
    
    // Only enforce CRON_SECRET if it's set AND an auth header is provided
    if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
      console.log(`[Good Morning] Unauthorized - returning 401`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[Good Morning] Authentication passed, proceeding...`);

    // Use cron client (no cookies/session required)
    let supabase;
    try {
      supabase = createCronClient();
      console.log(`[Good Morning] Supabase client created successfully`);
    } catch (error: any) {
      console.error(`[Good Morning] Failed to create Supabase client:`, error);
      return NextResponse.json(
        { error: `Failed to create Supabase client: ${error.message}` },
        { status: 500 }
      );
    }

    // Get app-level settings
    console.log(`[Good Morning] Fetching app settings...`);
    const { data: appSettings, error: appSettingsError } = await supabase
      .from("app_settings")
      .select("id, notifications_enabled, enable_sms")
      .limit(1)
      .single();

    if (appSettingsError) {
      console.error(`[Good Morning] Error fetching app settings:`, appSettingsError);
      return NextResponse.json(
        { error: `Failed to fetch app settings: ${appSettingsError.message}` },
        { status: 500 }
      );
    }
    console.log(`[Good Morning] App settings fetched:`, appSettings);

    // Check app-level notifications first
    if (appSettings && !appSettings.notifications_enabled) {
      console.log(`[Good Morning] Notifications disabled at app level`);
      return NextResponse.json({
        success: true,
        message: "Notifications are disabled at application level",
        executedAt: format(now, "yyyy-MM-dd HH:mm:ss") + " UTC",
        quoteSource: "none",
        profilesFound: 0,
        messagesSent: 0,
        results: [],
      });
    }

    // Check if SMS is enabled at app level
    if (appSettings && !appSettings.enable_sms) {
      console.log(`[Good Morning] SMS disabled at app level`);
      return NextResponse.json({
        success: true,
        message: "SMS notifications are disabled at application level",
        executedAt: format(now, "yyyy-MM-dd HH:mm:ss") + " UTC",
        quoteSource: "none",
        profilesFound: 0,
        messagesSent: 0,
        results: [],
      });
    }

    // Get daily quote
    console.log(`[Good Morning] Fetching daily quote...`);
    const quoteResult = await getDailyQuote();
    console.log(`[Good Morning] Quote retrieved from: ${quoteResult.source}`);

    // Get all family members with phone numbers and SMS enabled
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, phone_number, notifications_enabled, sms_enabled")
      .not("phone_number", "is", null);

    if (profilesError) {
      console.error(`[Good Morning] Error fetching profiles:`, profilesError);
      return NextResponse.json(
        { error: profilesError.message },
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      console.log(`[Good Morning] No profiles with phone numbers found`);
      return NextResponse.json({
        success: true,
        message: "No family members with phone numbers found",
        executedAt: format(now, "yyyy-MM-dd HH:mm:ss") + " UTC",
        quoteSource: quoteResult.source,
        quote: quoteResult.quote,
        profilesFound: 0,
        messagesSent: 0,
        results: [],
      });
    }

    // Filter profiles: SMS enabled and notifications enabled
    const eligibleProfiles = profiles.filter(
      (profile) =>
        profile.phone_number &&
        profile.notifications_enabled !== false &&
        profile.sms_enabled !== false
    );

    console.log(`[Good Morning] Found ${eligibleProfiles.length} eligible profiles`);

    if (eligibleProfiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No family members with SMS enabled found",
        executedAt: format(now, "yyyy-MM-dd HH:mm:ss") + " UTC",
        quoteSource: quoteResult.source,
        quote: quoteResult.quote,
        profilesFound: 0,
        messagesSent: 0,
        results: [],
      });
    }

    // Deduplicate profiles by phone number
    const uniqueProfilesByPhone = new Map<string, typeof eligibleProfiles[0]>();
    for (const profile of eligibleProfiles) {
      if (profile.phone_number && !uniqueProfilesByPhone.has(profile.phone_number)) {
        uniqueProfilesByPhone.set(profile.phone_number, profile);
      }
    }
    const deduplicatedProfiles = Array.from(uniqueProfilesByPhone.values());

    // Format good morning message
    const results = [];
    let messagesSent = 0;

    for (const profile of deduplicatedProfiles) {
      if (profile.phone_number && profile.notifications_enabled !== false) {
        // Format message with personalized name and quote
        const message = `🌅 Good Morning, ${profile.name}!\n\n${quoteResult.quote}\n\nHave a wonderful day! 💙`;

        // Send via SMS only
        const result = await sendNotificationToUser(
          profile.phone_number,
          profile.notifications_enabled ?? true,
          false, // WhatsApp disabled
          profile.sms_enabled ?? true, // SMS enabled
          message,
          appSettings || null
        );

        results.push({
          profileId: profile.id,
          name: profile.name,
          sms: result.sms,
          errors: result.errors,
        });

        if (result.sms) {
          messagesSent++;
        }
      }
    }

    console.log(`[Good Morning] Completed: ${messagesSent} messages sent`);

    return NextResponse.json({
      success: true,
      executedAt: format(now, "yyyy-MM-dd HH:mm:ss") + " UTC",
      quoteSource: quoteResult.source,
      quote: quoteResult.quote,
      quoteError: quoteResult.error,
      profilesFound: deduplicatedProfiles.length,
      messagesSent,
      results,
    });
  } catch (error: any) {
    console.error("[Good Morning] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send good morning messages" },
      { status: 500 }
    );
  }
}

