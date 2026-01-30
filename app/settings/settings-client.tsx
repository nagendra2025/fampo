"use client";

import { useState, useEffect } from "react";

interface AppSettings {
  notifications_enabled: boolean;
  enable_sms: boolean;
}

interface SettingsClientProps {
  initialSettings: AppSettings;
}

export default function SettingsClient({
  initialSettings,
}: SettingsClientProps) {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          Notification Settings
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          Control notification settings for the entire application. These settings
          apply to all family members and override individual user preferences.
        </p>
      </div>

      {/* Master Notifications Toggle */}
      <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label
              htmlFor="notifications_enabled"
              className="block text-lg font-semibold text-gray-900"
            >
              Enable Notifications
            </label>
            <p className="mt-1 text-sm text-gray-600">
              Master switch for all notifications. When disabled, no notifications
              will be sent regardless of individual user settings.
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              id="notifications_enabled"
              checked={settings.notifications_enabled}
              onChange={(e) =>
                setSettings({ ...settings, notifications_enabled: e.target.checked })
              }
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-indigo-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300"></div>
            <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
          </label>
        </div>
      </div>

      {/* SMS Toggle */}
      {settings.notifications_enabled && (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Notification Channels
          </h3>
          <p className="text-sm text-gray-600">
            Choose which notification channels are available. Individual users can
            still control their personal preferences.
          </p>

          {/* SMS Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex-1">
              <label
                htmlFor="enable_sms"
                className="block font-medium text-gray-900"
              >
                Enable SMS Notifications
              </label>
              <p className="mt-1 text-sm text-gray-600">
                Allow SMS notifications to be sent via Twilio
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                id="enable_sms"
                checked={settings.enable_sms}
                onChange={(e) =>
                  setSettings({ ...settings, enable_sms: e.target.checked })
                }
                disabled={!settings.notifications_enabled}
                className="peer sr-only disabled:opacity-50"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-indigo-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 peer-disabled:opacity-50"></div>
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-medium text-green-800">
            Settings saved successfully!
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Warning if notifications are disabled */}
      {!settings.notifications_enabled && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Notifications Disabled:</strong> Notifications are currently
            disabled. This may have happened automatically due to Twilio rate limits
            being exceeded. Enable notifications again to resume sending reminders.
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These are application-level settings. Individual
          family members can still control their personal notification preferences
          in their profile settings. Notifications will only be sent if both
          application-level and user-level settings are enabled.
        </p>
      </div>
    </div>
  );
}

