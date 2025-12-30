"use client";

import { useState } from "react";
import { format, parseISO, isPast, isToday } from "date-fns";
import TaskForm from "./task-form";
import TaskCard from "./task-card";
import SuccessMessage from "@/components/success-message";

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  assigned_to: "father" | "mother" | "son" | "daughter" | "all";
  completed: boolean;
  completed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface TasksClientProps {
  initialTasks: Task[];
}

type AssigneeFilter = "all" | "father" | "mother" | "son" | "daughter";

export default function TasksClient({ initialTasks }: TasksClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>("all");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshTasks = async () => {
    const response = await fetch("/api/tasks");
    if (response.ok) {
      const data = await response.json();
      setTasks(data.tasks);
    }
  };

  const handleCreateTask = async (
    taskData: Omit<Task, "id" | "created_by" | "created_at" | "updated_at" | "completed" | "completed_at">
  ) => {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    if (response.ok) {
      await refreshTasks();
      setShowForm(false);
      setSuccessMessage("Task created successfully!");
      setTimeout(() => setSuccessMessage(null), 2000);
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleUpdateTask = async (
    id: string,
    taskData: Partial<Task>
  ) => {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    if (response.ok) {
      await refreshTasks();
      setEditingTask(null);
      setShowForm(false); // Close the form after successful update
      setSuccessMessage("Task updated successfully!");
      setTimeout(() => setSuccessMessage(null), 2000);
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    await handleUpdateTask(task.id, {
      ...task,
      completed: !task.completed,
    });
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    const response = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      await refreshTasks();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (assigneeFilter === "all") return true;
    return task.assigned_to === assigneeFilter || task.assigned_to === "all";
  });

  // Separate completed and active tasks
  const activeTasks = filteredTasks.filter((task) => !task.completed);
  const completedTasks = filteredTasks.filter((task) => task.completed);

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
            Filter by:
          </label>
          <select
            id="filter"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value as AssigneeFilter)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Tasks</option>
            <option value="father">Father</option>
            <option value="mother">Mother</option>
            <option value="son">Son</option>
            <option value="daughter">Daughter</option>
          </select>
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-indigo-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          + Add Task
        </button>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={
            editingTask
              ? (data) => handleUpdateTask(editingTask.id, { ...editingTask, ...data })
              : handleCreateTask
          }
          onClose={handleFormClose}
        />
      )}

      {/* Active Tasks */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">Active Tasks</h2>
        {activeTasks.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-md">
            No active tasks. Add one to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={() => handleToggleComplete(task)}
                onEdit={() => handleEditClick(task)}
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Completed Tasks</h2>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={() => handleToggleComplete(task)}
                onEdit={() => handleEditClick(task)}
                onDelete={() => handleDeleteTask(task.id)}
                isCompleted
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

