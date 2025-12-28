"use client";

import { useState, useEffect } from "react";
import { format, parseISO, isPast, isToday, isTomorrow } from "date-fns";
import EventForm from "./event-form";
import EventCard from "./event-card";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string | null;
  notes: string | null;
  category: "school" | "health" | "travel" | "family";
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CalendarClientProps {
  initialEvents: Event[];
}

export default function CalendarClient({ initialEvents }: CalendarClientProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const refreshEvents = async () => {
    const response = await fetch("/api/events");
    if (response.ok) {
      const data = await response.json();
      setEvents(data.events);
    }
  };

  const handleCreateEvent = async (eventData: Omit<Event, "id" | "created_by" | "created_at" | "updated_at">) => {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });

    if (response.ok) {
      await refreshEvents();
      setShowForm(false);
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleUpdateEvent = async (
    id: string,
    eventData: Omit<Event, "id" | "created_by" | "created_at" | "updated_at">
  ) => {
    const response = await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });

    if (response.ok) {
      await refreshEvents();
      setEditingEvent(null);
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    const response = await fetch(`/api/events/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      await refreshEvents();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  // Separate events into upcoming and past
  const now = new Date();
  const upcomingEvents = events.filter((event) => {
    const eventDate = parseISO(event.date);
    return eventDate >= now || isToday(eventDate);
  });

  const pastEvents = events.filter((event) => {
    const eventDate = parseISO(event.date);
    return eventDate < now && !isToday(eventDate);
  });

  return (
    <div className="space-y-8">
      {/* Add Event Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-indigo-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          + Add Event
        </button>
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <EventForm
          event={editingEvent}
          onSubmit={editingEvent ? (data) => handleUpdateEvent(editingEvent.id, data) : handleCreateEvent}
          onClose={handleFormClose}
        />
      )}

      {/* Upcoming Events */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-md">
            No upcoming events. Add one to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => handleEditClick(event)}
                onDelete={() => handleDeleteEvent(event.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Past Events</h2>
          <div className="space-y-4">
            {pastEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => handleEditClick(event)}
                onDelete={() => handleDeleteEvent(event.id)}
                isPast
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

