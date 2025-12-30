"use client";

import { useState } from "react";
import NoteForm from "./note-form";
import NoteCard from "./note-card";
import SuccessMessage from "@/components/success-message";

interface Note {
  id: string;
  title: string;
  content: string;
  category: "emergency" | "health" | "school" | "general";
  is_readonly_for_kids: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface NotesClientProps {
  initialNotes: Note[];
  isParent: boolean;
}

type CategoryFilter = "all" | "emergency" | "health" | "school" | "general";

export default function NotesClient({ initialNotes, isParent }: NotesClientProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshNotes = async () => {
    const response = await fetch("/api/notes");
    if (response.ok) {
      const data = await response.json();
      setNotes(data.notes);
    }
  };

  const handleCreateNote = async (
    noteData: Omit<Note, "id" | "created_by" | "created_at" | "updated_at">
  ) => {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteData),
    });

    if (response.ok) {
      await refreshNotes();
      setShowForm(false);
      setSuccessMessage("Note created successfully!");
      setTimeout(() => setSuccessMessage(null), 2000);
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleUpdateNote = async (
    id: string,
    noteData: Omit<Note, "id" | "created_by" | "created_at" | "updated_at">
  ) => {
    const response = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteData),
    });

    if (response.ok) {
      await refreshNotes();
      setEditingNote(null);
      setShowForm(false); // Close the form after successful update
      setSuccessMessage("Note updated successfully!");
      setTimeout(() => setSuccessMessage(null), 2000);
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    const response = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      await refreshNotes();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleEditClick = (note: Note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  // Filter notes by category
  const filteredNotes = notes.filter((note) => {
    if (categoryFilter === "all") return true;
    return note.category === categoryFilter;
  });

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter */}
        <div className="flex items-center gap-3">
          <label htmlFor="filter" className="text-sm font-medium text-gray-700">
            Filter by category:
          </label>
          <select
            id="filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="emergency">Emergency</option>
            <option value="health">Health</option>
            <option value="school">School</option>
            <option value="general">General</option>
          </select>
        </div>

        {/* Add Note Button (only for parents) */}
        {isParent && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            + Add Note
          </button>
        )}
      </div>

      {/* Info message for kids */}
      {!isParent && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm text-blue-800">
            📖 You can view all notes, but only parents can create or edit them.
          </p>
        </div>
      )}

      {/* Note Form Modal */}
      {showForm && isParent && (
        <NoteForm
          note={editingNote}
          onSubmit={
            editingNote
              ? (data) => handleUpdateNote(editingNote.id, data)
              : handleCreateNote
          }
          onClose={handleFormClose}
        />
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-md">
          {categoryFilter === "all"
            ? "No notes yet. Add one to get started!"
            : `No notes in the ${categoryFilter} category.`}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isParent={isParent}
              onEdit={() => handleEditClick(note)}
              onDelete={() => handleDeleteNote(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

