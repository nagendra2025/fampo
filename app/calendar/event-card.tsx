"use client";

import { format, parseISO, isToday, isTomorrow } from "date-fns";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string | null;
  notes: string | null;
  category: "school" | "health" | "travel" | "family";
}

interface EventCardProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  isPast?: boolean;
}

const categoryColors = {
  school: "bg-blue-100 text-blue-800",
  health: "bg-red-100 text-red-800",
  travel: "bg-green-100 text-green-800",
  family: "bg-purple-100 text-purple-800",
};

const categoryLabels = {
  school: "School",
  health: "Health",
  travel: "Travel",
  family: "Family",
};

export default function EventCard({ event, onEdit, onDelete, isPast = false }: EventCardProps) {
  const eventDate = parseISO(event.date);
  const dateStr = format(eventDate, "EEEE, MMMM d, yyyy");
  
  let dateLabel = dateStr;
  if (isToday(eventDate)) {
    dateLabel = `Today, ${format(eventDate, "MMMM d, yyyy")}`;
  } else if (isTomorrow(eventDate)) {
    dateLabel = `Tomorrow, ${format(eventDate, "MMMM d, yyyy")}`;
  }

  const timeStr = event.time ? format(parseISO(`2000-01-01T${event.time}`), "h:mm a") : null;

  return (
    <div
      className={`rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg ${
        isPast ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${categoryColors[event.category]}`}
            >
              {categoryLabels[event.category]}
            </span>
          </div>

          <div className="mb-2 text-gray-600">
            <span className="font-medium">📅 {dateLabel}</span>
            {timeStr && <span className="ml-4">🕐 {timeStr}</span>}
          </div>

          {event.notes && (
            <p className="mt-2 text-gray-700">{event.notes}</p>
          )}
        </div>

        <div className="ml-4 flex gap-2">
          <button
            onClick={onEdit}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

