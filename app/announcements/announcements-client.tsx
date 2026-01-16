"use client";

import { useState, useEffect } from "react";
import { format, parseISO, isPast } from "date-fns";
import AnnouncementForm from "./announcement-form";
import AnnouncementCard from "./announcement-card";

interface Announcement {
  id: string;
  message: string;
  expires_at: string | null;
  created_by: string;
  created_at: string;
}

interface AnnouncementsClientProps {
  initialAnnouncements: Announcement[];
}

export default function AnnouncementsClient({
  initialAnnouncements,
}: AnnouncementsClientProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [showForm, setShowForm] = useState(false);

  const refreshAnnouncements = async () => {
    const response = await fetch("/api/announcements");
    if (response.ok) {
      const data = await response.json();
      // Filter out expired announcements on client side as well
      const now = new Date();
      const active = data.announcements.filter((ann: Announcement) => {
        if (!ann.expires_at) return true;
        return !isPast(parseISO(ann.expires_at));
      });
      setAnnouncements(active);
    }
  };

  // Auto-refresh every minute to remove expired announcements
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAnnouncements();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  const handleCreateAnnouncement = async (announcementData: {
    message: string;
    expires_at: string | null;
  }) => {
    const response = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(announcementData),
    });

    if (response.ok) {
      await refreshAnnouncements();
      setShowForm(false);
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    const response = await fetch(`/api/announcements/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      await refreshAnnouncements();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  // Filter out any expired announcements
  const now = new Date();
  const activeAnnouncements = announcements.filter((ann) => {
    if (!ann.expires_at) return true;
    return !isPast(parseISO(ann.expires_at));
  });

  return (
    <div className="space-y-8">
      {/* Info Message */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-800">
          💬 Announcements are read-only messages. No replies or discussions.
        </p>
      </div>

      {/* Add Announcement Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-indigo-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          + Add Announcement
        </button>
      </div>

      {/* Announcement Form Modal */}
      {showForm && (
        <AnnouncementForm
          onSubmit={handleCreateAnnouncement}
          onClose={handleFormClose}
        />
      )}

      {/* Announcements List */}
      {activeAnnouncements.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-md">
          No active announcements. Add one to share with the family!
        </div>
      ) : (
        <div className="space-y-4">
          {activeAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onDelete={() => handleDeleteAnnouncement(announcement.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}



