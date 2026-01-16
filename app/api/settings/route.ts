import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Get application settings
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get app settings (should only be one row)
    const { data: settings, error } = await supabase
      .from("app_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      // If no settings exist, return defaults
      if (error.code === "PGRST116") {
        return NextResponse.json({
          settings: {
            notifications_enabled: true,
            enable_sms: true,
            enable_whatsapp: true,
          },
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get settings" },
      { status: 500 }
    );
  }
}

// Update application settings
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notifications_enabled, enable_sms, enable_whatsapp } = body;

    // Validate input
    if (
      notifications_enabled !== undefined &&
      typeof notifications_enabled !== "boolean"
    ) {
      return NextResponse.json(
        { error: "notifications_enabled must be a boolean" },
        { status: 400 }
      );
    }

    if (enable_sms !== undefined && typeof enable_sms !== "boolean") {
      return NextResponse.json(
        { error: "enable_sms must be a boolean" },
        { status: 400 }
      );
    }

    if (enable_whatsapp !== undefined && typeof enable_whatsapp !== "boolean") {
      return NextResponse.json(
        { error: "enable_whatsapp must be a boolean" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (notifications_enabled !== undefined)
      updateData.notifications_enabled = notifications_enabled;
    if (enable_sms !== undefined) updateData.enable_sms = enable_sms;
    if (enable_whatsapp !== undefined)
      updateData.enable_whatsapp = enable_whatsapp;
    updateData.updated_by = user.id;

    // Get existing settings to ensure row exists
    const { data: existing } = await supabase
      .from("app_settings")
      .select("id")
      .limit(1)
      .single();

    let settings;
    if (existing) {
      // Update existing row
      const { data, error } = await supabase
        .from("app_settings")
        .update(updateData)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      settings = data;
    } else {
      // Insert new row (shouldn't happen if migration ran, but handle it)
      const { data, error } = await supabase
        .from("app_settings")
        .insert({
          notifications_enabled: notifications_enabled ?? true,
          enable_sms: enable_sms ?? true,
          enable_whatsapp: enable_whatsapp ?? true,
          updated_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      settings = data;
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}



