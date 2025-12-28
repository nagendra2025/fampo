"use client";

import { useState, useEffect } from "react";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string | null;
  notes: string | null;
  category: "school" | "health" | "travel" | "family";
}

interface EventFormProps {
  event?: Event | null;
  onSubmit: (data: Omit<Event, "id" | "created_by" | "created_at" | "updated_at">) => void;
  onClose: () => void;
}

export default function EventForm({ event, onSubmit, onClose }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<"school" | "health" | "travel" | "family">("family");

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDate(event.date);
      setTime(event.time || "");
      setNotes(event.notes || "");
      setCategory(event.category);
    } else {
      // Set default date to today
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !date) {
      alert("Please fill in all required fields");
      return;
    }

    onSubmit({
      title: title.trim(),
      date,
      time: time || null,
      notes: notes.trim() || null,
      category,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          {event ? "Edit Event" : "Add New Event"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Event title"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date *
            </label>
            <input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Time (optional)
            </label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              id="category"
              required
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as "school" | "health" | "travel" | "family")
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="family">Family</option>
              <option value="school">School</option>
              <option value="health">Health</option>
              <option value="travel">Travel</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Additional details..."
            />
          </div>

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
              {event ? "Update" : "Create"} Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

