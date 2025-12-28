import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CalendarClient from "./calendar-client";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch events
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true })
    .order("time", { ascending: true, nullsFirst: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Family Calendar</h1>
          <p className="mt-2 text-lg text-gray-600">
            Keep track of events, appointments, and important dates
          </p>
        </header>

        <CalendarClient initialEvents={events || []} />
      </div>
    </div>
  );
}

