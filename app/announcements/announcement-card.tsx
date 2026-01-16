"use client";

import { format, parseISO, isPast } from "date-fns";

interface Announcement {
  id: string;
  message: string;
  expires_at: string | null;
  created_at: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  onDelete: () => void;
}

export default function AnnouncementCard({
  announcement,
  onDelete,
}: AnnouncementCardProps) {
  const createdDate = parseISO(announcement.created_at);
  const dateStr = format(createdDate, "MMM d, yyyy 'at' h:mm a");

  const getExpiryInfo = () => {
    if (!announcement.expires_at) return null;

    const expiryDate = parseISO(announcement.expires_at);
    const isExpired = isPast(expiryDate);

    if (isExpired) return null; // Shouldn't show expired, but just in case

    const expiryStr = format(expiryDate, "MMM d, yyyy 'at' h:mm a");
    const hoursUntilExpiry = Math.round(
      (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60)
    );

    if (hoursUntilExpiry < 24) {
      return { text: `Expires in ${hoursUntilExpiry} hour(s)`, urgent: true };
    }

    return { text: `Expires: ${expiryStr}`, urgent: false };
  };

  const expiryInfo = getExpiryInfo();

  return (
    <div className="rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg border-l-4 border-indigo-500">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Message */}
          <p className="mb-3 text-lg text-gray-900 whitespace-pre-wrap leading-relaxed">
            {announcement.message}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>📅 {dateStr}</span>
            {expiryInfo && (
              <span
                className={
                  expiryInfo.urgent
                    ? "font-semibold text-orange-600"
                    : "text-gray-500"
                }
              >
                ⏰ {expiryInfo.text}
              </span>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 flex-shrink-0"
        >
          Delete
        </button>
      </div>
    </div>
  );
}



