"use client";

import { useState, useEffect } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  category: "emergency" | "health" | "school" | "general";
  is_readonly_for_kids: boolean;
}

interface NoteFormProps {
  note?: Note | null;
  onSubmit: (data: Omit<Note, "id" | "created_by" | "created_at" | "updated_at">) => Promise<void> | void;
  onClose: () => void;
}

export default function NoteForm({ note, onSubmit, onClose }: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"emergency" | "health" | "school" | "general">("general");
  const [isReadonlyForKids, setIsReadonlyForKids] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setIsReadonlyForKids(note.is_readonly_for_kids);
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Please fill in both title and content");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category,
        is_readonly_for_kids: isReadonlyForKids,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          {note ? "Edit Note" : "Add New Note"}
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
              placeholder="e.g., Wi-Fi Password, Doctor Contact"
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
                setCategory(e.target.value as "emergency" | "health" | "school" | "general")
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="general">General</option>
              <option value="emergency">Emergency</option>
              <option value="health">Health</option>
              <option value="school">School</option>
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content *
            </label>
            <textarea
              id="content"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter the note content here..."
            />
            <p className="mt-1 text-xs text-gray-500">
              This information will be visible to all family members.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="readonly"
              type="checkbox"
              checked={isReadonlyForKids}
              onChange={(e) => setIsReadonlyForKids(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            <label htmlFor="readonly" className="text-sm font-medium text-gray-700">
              Read-only for kids (only parents can edit)
            </label>
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
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-lg font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? note
                  ? "Updating..."
                  : "Creating..."
                : note
                  ? "Update Note"
                  : "Create Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

