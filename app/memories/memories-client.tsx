"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import MemoryForm from "./memory-form";
import MemoryCard from "./memory-card";
import SuccessMessage from "@/components/success-message";

interface Memory {
  id: string;
  photo_url: string;
  note: string | null;
  created_by: string;
  created_at: string;
}

interface MemoriesClientProps {
  initialMemories: Memory[];
}

export default function MemoriesClient({
  initialMemories,
}: MemoriesClientProps) {
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [showForm, setShowForm] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshMemories = async () => {
    const response = await fetch("/api/memories");
    if (response.ok) {
      const data = await response.json();
      setMemories(data.memories);
    }
  };

  const handleCreateMemory = async (memoryData: {
    photo_url: string;
    note: string | null;
  }) => {
    const response = await fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(memoryData),
    });

    if (response.ok) {
      await refreshMemories();
      setShowForm(false);
      setSuccessMessage("Memory created successfully!");
      setTimeout(() => setSuccessMessage(null), 2000);
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleUpdateMemory = async (
    id: string,
    memoryData: { note: string | null }
  ) => {
    const response = await fetch(`/api/memories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(memoryData),
    });

    if (response.ok) {
      await refreshMemories();
      setEditingMemory(null);
      setShowForm(false); // Close the form after successful update
      setSuccessMessage("Memory updated successfully!");
      setTimeout(() => setSuccessMessage(null), 2000);
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this memory?")) {
      return;
    }

    const response = await fetch(`/api/memories/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      await refreshMemories();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleEditClick = (memory: Memory) => {
    setEditingMemory(memory);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMemory(null);
  };

  // Group memories by date for timeline view
  const groupedMemories = memories.reduce((acc, memory) => {
    const date = parseISO(memory.created_at);
    const dateKey = format(date, "MMMM d, yyyy");
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(memory);
    return acc;
  }, {} as Record<string, Memory[]>);

  const sortedDates = Object.keys(groupedMemories).sort((a, b) => {
    return parseISO(groupedMemories[b][0].created_at).getTime() -
           parseISO(groupedMemories[a][0].created_at).getTime();
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

      {/* Add Memory Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-indigo-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          + Add Memory
        </button>
      </div>

      {/* Memory Form Modal */}
      {showForm && (
        <MemoryForm
          memory={editingMemory}
          onSubmit={
            editingMemory
              ? (data) => handleUpdateMemory(editingMemory.id, data)
              : handleCreateMemory
          }
          onClose={handleFormClose}
        />
      )}

      {/* Timeline View */}
      {memories.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-md">
          No memories yet. Add one to preserve a special moment!
        </div>
      ) : (
        <div className="space-y-12">
          {sortedDates.map((dateKey) => (
            <div key={dateKey} className="relative">
              {/* Date Header */}
              <div className="mb-6 flex items-center">
                <div className="h-px flex-1 bg-gray-300"></div>
                <h2 className="mx-4 text-2xl font-bold text-gray-800">
                  {dateKey}
                </h2>
                <div className="h-px flex-1 bg-gray-300"></div>
              </div>

              {/* Memories Grid for this date */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groupedMemories[dateKey].map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    onEdit={() => handleEditClick(memory)}
                    onDelete={() => handleDeleteMemory(memory.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

