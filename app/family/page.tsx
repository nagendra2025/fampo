import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FamilyPageClient from "./family-page-client";

export default async function FamilyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get current user profile
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch all family profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("role", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Our Family</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage family member profiles and information
          </p>
        </header>

        <FamilyPageClient
          profiles={profiles || []}
          currentProfile={currentProfile}
        />
      </div>
    </div>
  );
}



