import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch app settings
  const { data: settingsData } = await supabase
    .from("app_settings")
    .select("*")
    .limit(1)
    .single();

  const settings = settingsData || {
    notifications_enabled: true,
    enable_sms: true,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-4xl font-bold text-gray-900">
            Application Settings
          </h1>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <SettingsClient initialSettings={settings} />
          </div>
        </div>
      </div>
    </div>
  );
}



