import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { addDays, format } from "date-fns";

// Diagnostic endpoint to check notification system status
export async function GET() {
  try {
    const supabase = await createClient();
    const now = new Date();
    const tomorrow = addDays(now, 1);
    const tomorrowDateStr = format(tomorrow, "yyyy-MM-dd");
    const todayDateStr = format(now, "yyyy-MM-dd");

    // Check app settings
    const { data: appSettings, error: appSettingsError } = await supabase
      .from("app_settings")
      .select("id, notifications_enabled, enable_sms, updated_at")
      .limit(1)
      .single();

    // Check profiles with phone numbers
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, phone_number, notifications_enabled, sms_enabled")
      .not("phone_number", "is", null);

    // Check events for tomorrow
    const { data: eventsTomorrow, error: eventsTomorrowError } = await supabase
      .from("events")
      .select("id, title, date")
      .eq("date", tomorrowDateStr);

    // Check tasks for tomorrow
    const { data: tasksTomorrow, error: tasksTomorrowError } = await supabase
      .from("tasks")
      .select("id, title, due_date, completed")
      .eq("due_date", tomorrowDateStr)
      .eq("completed", false);

    // Check events for today (for reference)
    const { data: eventsToday } = await supabase
      .from("events")
      .select("id, title, date")
      .eq("date", todayDateStr);

    // Check tasks for today (for reference)
    const { data: tasksToday } = await supabase
      .from("tasks")
      .select("id, title, due_date, completed")
      .eq("due_date", todayDateStr)
      .eq("completed", false);

    // Check environment variables (without exposing secrets)
    const envCheck = {
      TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
      TWILIO_SMS_FROM: !!process.env.TWILIO_SMS_FROM,
      CRON_SECRET: !!process.env.CRON_SECRET,
    };

    return NextResponse.json({
      success: true,
      timestamp: format(now, "yyyy-MM-dd HH:mm:ss") + " UTC",
      timezone: "UTC",
      dates: {
        today: todayDateStr,
        tomorrow: tomorrowDateStr,
      },
      appSettings: appSettings
        ? {
            notifications_enabled: appSettings.notifications_enabled,
            enable_sms: appSettings.enable_sms,
            updated_at: appSettings.updated_at,
          }
        : null,
      appSettingsError: appSettingsError?.message || null,
      profiles: {
        total: profiles?.length || 0,
        withPhoneNumbers: profiles?.filter((p) => p.phone_number).length || 0,
        withNotificationsEnabled: profiles?.filter((p) => p.notifications_enabled !== false).length || 0,
        list: profiles?.map((p) => ({
          name: p.name,
          hasPhone: !!p.phone_number,
          notifications_enabled: p.notifications_enabled,
          sms_enabled: p.sms_enabled,
        })) || [],
      },
      profilesError: profilesError?.message || null,
      events: {
        today: eventsToday?.length || 0,
        tomorrow: eventsTomorrow?.length || 0,
        tomorrowList: eventsTomorrow?.map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
        })) || [],
      },
      eventsError: eventsTomorrowError?.message || null,
      tasks: {
        today: tasksToday?.length || 0,
        tomorrow: tasksTomorrow?.length || 0,
        tomorrowList: tasksTomorrow?.map((t) => ({
          id: t.id,
          title: t.title,
          due_date: t.due_date,
        })) || [],
      },
      tasksError: tasksTomorrowError?.message || null,
      environment: envCheck,
      cronSchedule: "0 9 * * * (9:00 AM UTC daily)",
      recommendations: {
        checkAppSettings: !appSettings?.notifications_enabled
          ? "⚠️ Notifications are disabled at app level"
          : "✅ App-level notifications enabled",
        checkProfiles: !profiles || profiles.length === 0
          ? "⚠️ No profiles with phone numbers found"
          : `✅ Found ${profiles.length} profiles with phone numbers`,
        checkEvents: eventsTomorrow?.length === 0
          ? `ℹ️ No events found for ${tomorrowDateStr}`
          : `✅ Found ${eventsTomorrow?.length || 0} events for ${tomorrowDateStr}`,
        checkTasks: tasksTomorrow?.length === 0
          ? `ℹ️ No tasks found for ${tomorrowDateStr}`
          : `✅ Found ${tasksTomorrow?.length || 0} tasks for ${tomorrowDateStr}`,
        checkEnv: !envCheck.TWILIO_ACCOUNT_SID || !envCheck.TWILIO_AUTH_TOKEN
          ? "⚠️ Twilio credentials not configured"
          : "✅ Twilio credentials configured",
      },
    });
  } catch (error: any) {
    console.error("Diagnostic error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to run diagnostics" },
      { status: 500 }
    );
  }
}


