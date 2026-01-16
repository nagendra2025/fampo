"use client";

import { useState } from "react";

interface AnnouncementFormProps {
  onSubmit: (data: { message: string; expires_at: string | null }) => void;
  onClose: () => void;
}

export default function AnnouncementForm({
  onSubmit,
  onClose,
}: AnnouncementFormProps) {
  const [message, setMessage] = useState("");
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    let expiresAt: string | null = null;

    if (hasExpiry && expiryDate) {
      if (expiryTime) {
        // Combine date and time
        expiresAt = `${expiryDate}T${expiryTime}:00`;
      } else {
        // Just date, set to end of day
        expiresAt = `${expiryDate}T23:59:59`;
      }
    }

    onSubmit({
      message: message.trim(),
      expires_at: expiresAt,
    });
  };

  // Set default expiry to tomorrow
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Add New Announcement
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message *
            </label>
            <textarea
              id="message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Dinner at 8 PM, Leaving at 6:30 AM tomorrow..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Keep it short and clear. This is a one-way message, no replies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="hasExpiry"
              type="checkbox"
              checked={hasExpiry}
              onChange={(e) => {
                setHasExpiry(e.target.checked);
                if (e.target.checked && !expiryDate) {
                  setExpiryDate(getTomorrowDate());
                }
              }}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            <label htmlFor="hasExpiry" className="text-sm font-medium text-gray-700">
              Set expiry date (optional)
            </label>
          </div>

          {hasExpiry && (
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  id="expiryDate"
                  type="date"
                  required={hasExpiry}
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="expiryTime" className="block text-sm font-medium text-gray-700">
                  Expiry Time (optional)
                </label>
                <input
                  id="expiryTime"
                  type="time"
                  value={expiryTime}
                  onChange={(e) => setExpiryTime(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-lg font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-lg font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Create Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



