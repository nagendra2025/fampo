"use client";

import { useState } from "react";

export default function TestNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testReminders = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/notifications/reminders", {
        credentials: "include",
      });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to test reminders");
    } finally {
      setLoading(false);
    }
  };

  const testManualSend = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          type: "event",
          itemId: "test-id-" + Date.now(),
          itemTitle: "Test Event - " + new Date().toLocaleString(),
          itemDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // Tomorrow
          itemTime: "10:00",
          creatorName: "Test User",
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/notifications/diagnose", {
        credentials: "include",
      });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to run diagnostics");
    } finally {
      setLoading(false);
    }
  };

  const testGoodMorning = async () => {
    // Warning: This will send REAL SMS messages to all family members
    const confirmed = window.confirm(
      "⚠️ WARNING: This will send REAL Good Morning SMS messages to ALL family members with SMS enabled.\n\n" +
      "This is not a test - actual messages will be sent via Twilio.\n\n" +
      "Do you want to continue?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/notifications/good-morning", {
        credentials: "include",
      });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to test good morning notifications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">
          Test Notifications
        </h1>

        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-lg">
          <div className="space-y-4">
            <button
              onClick={testReminders}
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Reminders Endpoint"}
            </button>

            <button
              onClick={testManualSend}
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending..." : "Test Manual Notification Send"}
            </button>

            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Running..." : "🔍 Run Diagnostics"}
            </button>

            <button
              onClick={testGoodMorning}
              disabled={loading}
              className="w-full rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending..." : "🌅 Test Good Morning Notifications"}
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-medium text-red-800">
                Error: {error}
              </p>
            </div>
          )}

          {result && (
            <div className={`rounded-lg border p-4 ${
              result.rateLimitExceeded
                ? "bg-yellow-50 border-yellow-200"
                : "bg-green-50 border-green-200"
            }`}>
              {result.rateLimitExceeded && (
                <div className="mb-3 rounded-lg bg-yellow-100 border border-yellow-300 p-3">
                  <h3 className="mb-1 font-semibold text-yellow-900">
                    ⚠️ Rate Limit Exceeded
                  </h3>
                  <p className="text-sm text-yellow-800">
                    {result.message || "Twilio daily message limit exceeded. Notifications have been automatically disabled."}
                  </p>
                </div>
              )}
              
              {/* Special display for Good Morning notifications */}
              {result.quote && (
                <div className="mb-4 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-orange-900">
                    🌅 Daily Quote ({result.quoteSource || "unknown source"})
                  </h3>
                  <p className="text-base italic text-orange-800 leading-relaxed">
                    "{result.quote}"
                  </p>
                  {result.quoteError && (
                    <p className="mt-2 text-xs text-orange-600">
                      Note: {result.quoteError}
                    </p>
                  )}
                  {result.messagesSent !== undefined && (
                    <p className="mt-3 text-sm font-medium text-orange-900">
                      ✅ {result.messagesSent} message{result.messagesSent !== 1 ? "s" : ""} sent to {result.profilesFound || 0} family member{result.profilesFound !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              )}
              
              <h3 className={`mb-2 font-semibold ${
                result.rateLimitExceeded ? "text-yellow-900" : "text-green-900"
              }`}>Result:</h3>
              <pre className={`overflow-auto text-xs ${
                result.rateLimitExceeded ? "text-yellow-800" : "text-green-800"
              }`}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Make sure you have:
              <br />• Phone numbers added to user profiles
              <br />• Twilio credentials in `.env.local`
              <br />• App-level notifications enabled (Settings page)
            </p>
          </div>

          <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
            <p className="text-sm text-orange-800">
              <strong>⚠️ Important:</strong> The "Test Good Morning Notifications" button will send <strong>REAL SMS messages</strong> to all family members. 
              This is not a simulation - actual messages will be sent via Twilio if configured.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

