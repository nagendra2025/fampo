import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Navigation() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const navItems = [
    { href: "/home", label: "Home", icon: "🏠" },
    { href: "/calendar", label: "Calendar", icon: "📅" },
    { href: "/tasks", label: "Tasks", icon: "✓" },
    { href: "/notes", label: "Notes", icon: "📝" },
    { href: "/announcements", label: "Announcements", icon: "📢" },
    { href: "/memories", label: "Memories", icon: "📸" },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/home" className="text-xl font-bold text-gray-900">
            Rasna
          </Link>
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
          <form action="/auth/signout" method="post" className="ml-4">
            <button
              type="submit"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}

