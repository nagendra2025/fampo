import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TasksClient from "./tasks-client";

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch tasks
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .order("completed", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">To-Do Lists</h1>
          <p className="mt-2 text-lg text-gray-600">
            Personal and family tasks. Stay organized and on track.
          </p>
        </header>

        <TasksClient initialTasks={tasks || []} />
      </div>
    </div>
  );
}

