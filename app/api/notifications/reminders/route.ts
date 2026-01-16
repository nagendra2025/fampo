import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  sendNotificationToUser,
  formatTaskReminderMessage,
  formatEventReminderMessage,
} from "@/lib/services/notifications";
import { addDays, format } from "date-fns";

// This endpoint should be called by a cron job (e.g., Vercel Cron or external service)
// It checks for events and tasks due tomorrow and sends reminders

// Force dynamic execution - prevents caching and ensures cron jobs run every time
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Log immediately - even before try/catch to ensure we see if endpoint is called
  const now = new Date();
  const tomorrow = addDays(now, 1);
  const tomorrowDateStr = format(tomorrow, "yyyy-MM-dd");
  
  console.log(`[CRON] ===== REMINDERS ENDPOINT CALLED ===== ${format(now, "yyyy-MM-dd HH:mm:ss")} UTC`);
  console.log(`[CRON] Request URL: ${request.url}`);
  console.log(`[CRON] Request headers:`, Object.fromEntries(request.headers.entries()));
  console.log(`[CRON] Looking for events/tasks on: ${tomorrowDateStr}`);
  
  try {
    // Optional: Add API key authentication for cron jobs
    // Note: Vercel Cron doesn't send Authorization headers automatically
    // If CRON_SECRET is set, you can use it for manual testing, but Vercel Cron will work without it
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    console.log(`[CRON] CRON_SECRET exists: ${!!cronSecret}`);
    console.log(`[CRON] Auth header exists: ${!!authHeader}`);
    
    // Only enforce CRON_SECRET if it's set AND an auth header is provided
    // This allows Vercel Cron to work without the header, but still protects manual access
    if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
      console.log(`[CRON] Unauthorized - returning 401`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[CRON] Authentication passed, proceeding...`);

    const supabase = await createClient();

    // Get app-level settings
    const { data: appSettings } = await supabase
      .from("app_settings")
      .select("id, notifications_enabled, enable_sms, enable_whatsapp")
      .limit(1)
      .single();

    // Check app-level notifications first
    if (appSettings && !appSettings.notifications_enabled) {
      console.log(`[CRON] Notifications disabled at app level`);
      return NextResponse.json({
        success: true,
        message: "Notifications are disabled at application level",
        date: tomorrowDateStr,
        eventsFound: 0,
        tasksFound: 0,
        notificationsSent: { events: 0, tasks: 0 },
        results: { events: [], tasks: [] },
      });
    }

    console.log(`[CRON] App settings: notifications=${appSettings?.notifications_enabled}, sms=${appSettings?.enable_sms}, whatsapp=${appSettings?.enable_whatsapp}`);

    // Get all family members with phone numbers and notification preferences
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, phone_number, notifications_enabled, whatsapp_enabled, sms_enabled")
      .not("phone_number", "is", null);

    if (profilesError) {
      console.error(`[CRON] Error fetching profiles:`, profilesError);
      return NextResponse.json(
        { error: profilesError.message },
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      console.log(`[CRON] No profiles with phone numbers found`);
      return NextResponse.json({
        success: true,
        message: "No family members with phone numbers found",
        date: tomorrowDateStr,
        eventsFound: 0,
        tasksFound: 0,
        notificationsSent: { events: 0, tasks: 0 },
        results: { events: [], tasks: [] },
      });
    }

    console.log(`[CRON] Found ${profiles.length} profiles with phone numbers`);

    // Deduplicate profiles by phone number to avoid sending duplicate notifications
    // If multiple profiles have the same phone number, only send to the first one
    const uniqueProfilesByPhone = new Map<string, typeof profiles[0]>();
    for (const profile of profiles) {
      if (profile.phone_number && !uniqueProfilesByPhone.has(profile.phone_number)) {
        uniqueProfilesByPhone.set(profile.phone_number, profile);
      }
    }
    const deduplicatedProfiles = Array.from(uniqueProfilesByPhone.values());

    // Get events due tomorrow
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, title, date, time, created_by, profiles!events_created_by_fkey(name)")
      .eq("date", tomorrowDateStr);

    if (eventsError) {
      console.error(`[CRON] Error fetching events:`, eventsError);
    } else {
      console.log(`[CRON] Found ${events?.length || 0} events for ${tomorrowDateStr}`);
    }

    // Get tasks due tomorrow (not completed)
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, title, due_date, created_by, profiles!tasks_created_by_fkey(name)")
      .eq("due_date", tomorrowDateStr)
      .eq("completed", false);

    if (tasksError) {
      console.error(`[CRON] Error fetching tasks:`, tasksError);
    } else {
      console.log(`[CRON] Found ${tasks?.length || 0} tasks for ${tomorrowDateStr}`);
    }

    const results = {
      events: [] as any[],
      tasks: [] as any[],
    };

    let rateLimitDetected = false;

    // Send event reminders
    if (events && events.length > 0) {
      for (const event of events) {
        const creatorName = (event.profiles as any)?.name || null;
        const message = formatEventReminderMessage(
          event.title,
          format(new Date(event.date), "MMMM d, yyyy"),
          event.time || null,
          creatorName
        );

        // Send to all family members (deduplicated by phone number)
        for (const profile of deduplicatedProfiles) {
          if (
            profile.phone_number &&
            profile.notifications_enabled !== false
          ) {
            const result = await sendNotificationToUser(
              profile.phone_number,
              profile.notifications_enabled ?? true,
              profile.whatsapp_enabled ?? true,
              profile.sms_enabled ?? true,
              message,
              appSettings || null
            );
            
            // Track if rate limit was detected
            if (result.rateLimited) {
              rateLimitDetected = true;
            }
            
            results.events.push({
              eventId: event.id,
              eventTitle: event.title,
              profileId: profile.id,
              profileName: profile.name,
              whatsapp: result.whatsapp,
              sms: result.sms,
              errors: result.errors,
            });
          }
        }
      }
    }

    // Send task reminders
    if (tasks && tasks.length > 0) {
      for (const task of tasks) {
        const creatorName = (task.profiles as any)?.name || null;
        const message = formatTaskReminderMessage(
          task.title,
          format(new Date(task.due_date), "MMMM d, yyyy"),
          creatorName
        );

        // Send to all family members (deduplicated by phone number)
        for (const profile of deduplicatedProfiles) {
          if (
            profile.phone_number &&
            profile.notifications_enabled !== false
          ) {
            const result = await sendNotificationToUser(
              profile.phone_number,
              profile.notifications_enabled ?? true,
              profile.whatsapp_enabled ?? true,
              profile.sms_enabled ?? true,
              message,
              appSettings || null
            );
            results.tasks.push({
              taskId: task.id,
              taskTitle: task.title,
              profileId: profile.id,
              profileName: profile.name,
              whatsapp: result.whatsapp,
              sms: result.sms,
              errors: result.errors,
            });
          }
        }
      }
    }

    // Auto-disable notifications if rate limit was detected
    if (rateLimitDetected && appSettings) {
      await supabase
        .from("app_settings")
        .update({ notifications_enabled: false })
        .eq("id", appSettings.id);
    }

    const notificationsSent = {
      events: results.events.filter((r) => r.whatsapp || r.sms).length,
      tasks: results.tasks.filter((r) => r.whatsapp || r.sms).length,
    };

    console.log(`[CRON] Completed: ${notificationsSent.events} event notifications, ${notificationsSent.tasks} task notifications sent`);

    const response: any = {
      success: true,
      date: tomorrowDateStr,
      executedAt: format(now, "yyyy-MM-dd HH:mm:ss") + " UTC",
      eventsFound: events?.length || 0,
      tasksFound: tasks?.length || 0,
      profilesFound: deduplicatedProfiles.length,
      notificationsSent,
      results,
    };

    if (rateLimitDetected) {
      response.rateLimitExceeded = true;
      response.message = "Twilio daily message limit exceeded. Notifications have been automatically disabled. They will need to be manually re-enabled after the limit resets (typically at midnight).";
      console.log(`[CRON] Rate limit detected - notifications disabled`);
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Reminder cron error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process reminders" },
      { status: 500 }
    );
  }
}

