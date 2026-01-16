import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AnnouncementsClient from "./announcements-client";

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch active announcements (not expired)
  const { data: announcements, error } = await supabase
    .from("announcements")
    .select("*")
    .or("expires_at.is.null,expires_at.gt.now()")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Announcements</h1>
          <p className="mt-2 text-lg text-gray-600">
            Quick messages and updates for the whole family
          </p>
        </header>

        <AnnouncementsClient initialAnnouncements={announcements || []} />
      </div>
    </div>
  );
}



