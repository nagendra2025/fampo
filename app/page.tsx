import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-6xl font-bold text-gray-900">
            Welcome to Rasna
          </h1>
          <p className="mb-4 text-2xl text-gray-700">
            Your family dashboard for coordination, reminders, and memories
          </p>
          <p className="mb-12 text-lg text-gray-600">
            A calm, supportive space for your family to stay connected and
            organized—without the noise of social media.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border-2 border-indigo-600 px-8 py-4 text-lg font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mx-auto mt-24 max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-gray-900">
            Everything Your Family Needs
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-4 text-4xl">📅</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                Family Calendar
              </h3>
              <p className="text-gray-600">
                Keep track of events, appointments, and important dates all in
                one place.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-4 text-4xl">✓</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                To-Do Lists
              </h3>
              <p className="text-gray-600">
                Personal and shared tasks to help everyone stay organized.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-4 text-4xl">📝</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                Family Notes
              </h3>
              <p className="text-gray-600">
                Store important information like passwords, contacts, and
                instructions.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-4 text-4xl">📢</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                Announcements
              </h3>
              <p className="text-gray-600">
                Quick messages and updates without the noise of chat.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-4 text-4xl">📸</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                Family Memories
              </h3>
              <p className="text-gray-600">
                Preserve and share special moments with photos and notes.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-4 text-4xl">🔒</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                Private & Secure
              </h3>
              <p className="text-gray-600">
                Your family's information stays private and secure.
              </p>
            </div>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="mx-auto mt-24 max-w-3xl rounded-2xl bg-white p-12 shadow-lg">
          <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">
            Built for Families
          </h2>
          <div className="space-y-4 text-center text-lg text-gray-700">
            <p>
              <strong>Calm.</strong> No notifications, no pressure, no
              distractions.
            </p>
            <p>
              <strong>Supportive.</strong> Designed to help, not control.
            </p>
            <p>
              <strong>Respectful.</strong> A digital notice board, not
              surveillance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
