import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import FamilySection from "@/components/family-section";
import AnimatedRasna from "@/components/animated-rasna";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch current user's profile
  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("nick_name, photo_url, name")
    .eq("id", user.id)
    .single();

  // Fetch all family profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("role", { ascending: true })
    .order("created_at", { ascending: true });

  // Get display name (nick_name or name or email prefix)
  const displayName = currentUserProfile?.nick_name || 
                      currentUserProfile?.name || 
                      user.email?.split("@")[0] || 
                      "User";

  // Get profile picture URL
  const profilePhotoUrl = currentUserProfile?.photo_url;

  // Get initial letter for fallback
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-gray-900">
            Welcome to <AnimatedRasna className="inline-block" />
          </h1>
          <p className="text-xl text-gray-600">
            Your family dashboard for coordination, reminders, and memories!
          </p>
        </header>

        {/* Main Content */}
        <div className="mx-auto max-w-6xl">
          {/* Quick Stats or Welcome Message */}
          <div className="mb-12 rounded-2xl bg-white p-8 shadow-lg">
            <div className="flex items-center gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                {profilePhotoUrl ? (
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-indigo-200 shadow-md">
                    <Image
                      src={profilePhotoUrl}
                      alt={displayName}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-indigo-200 bg-indigo-100 text-3xl font-bold text-indigo-700 shadow-md">
                    {initialLetter}
                  </div>
                )}
              </div>
              
              {/* Greeting */}
              <div className="flex-1">
                <h2 className="mb-2 text-3xl font-semibold text-gray-800">
                  Hello, {displayName}!!
                </h2>
                <p className="text-lg text-gray-600">
                  Everything your family needs is right here. Choose where you'd
                  like to go!!!
                </p>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Calendar */}
            <Link
              href="/calendar"
              className="group rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-xl"
            >
              <div className="mb-4 text-4xl">📅</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                Calendar & Events
              </h3>
              <p className="text-gray-600">
                View and manage family events, appointments, and important dates.
              </p>
            </Link>

            {/* Tasks */}
            <Link
              href="/tasks"
              className="group rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-xl"
            >
              <div className="mb-4 text-4xl">✓</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                To-Do Lists
              </h3>
              <p className="text-gray-600">
                Personal and family tasks. Stay organized and on track.
              </p>
            </Link>

            {/* Notes */}
            <Link
              href="/notes"
              className="group rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-xl"
            >
              <div className="mb-4 text-4xl">📝</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                Family Notes
              </h3>
              <p className="text-gray-600">
                Important information everyone needs to know.
              </p>
            </Link>

            {/* Announcements */}
            <Link
              href="/announcements"
              className="group rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-xl"
            >
              <div className="mb-4 text-4xl">📢</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                Announcements
              </h3>
              <p className="text-gray-600">
                Quick messages and updates for the whole family.
              </p>
            </Link>

            {/* Memories */}
            <Link
              href="/memories"
              className="group rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-xl"
            >
              <div className="mb-4 text-4xl">📸</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                Family Memories
              </h3>
              <p className="text-gray-600">
                Preserve and share special family moments.
              </p>
            </Link>

            {/* Coming Soon Placeholder */}
            <div className="rounded-xl bg-gray-100 p-6 opacity-60">
              <div className="mb-4 text-4xl">✨</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-600">
                More Features
              </h3>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>

          {/* Meet the Family Section */}
          <FamilySection profiles={profiles || []} currentUserId={user.id} />
        </div>

        {/* Footer with Logout */}
        <div className="mt-12 text-center">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg bg-gray-200 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-300"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

