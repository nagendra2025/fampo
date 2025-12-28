"use client";

import { format, parseISO, isPast, isToday } from "date-fns";

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  assigned_to: "father" | "mother" | "son" | "daughter" | "all";
  completed: boolean;
}

interface TaskCardProps {
  task: Task;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isCompleted?: boolean;
}

const assigneeLabels = {
  father: "Father",
  mother: "Mother",
  son: "Son",
  daughter: "Daughter",
  all: "Everyone",
};

const assigneeColors = {
  father: "bg-blue-100 text-blue-800",
  mother: "bg-pink-100 text-pink-800",
  son: "bg-green-100 text-green-800",
  daughter: "bg-purple-100 text-purple-800",
  all: "bg-gray-100 text-gray-800",
};

export default function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  isCompleted = false,
}: TaskCardProps) {
  const getDueDateLabel = () => {
    if (!task.due_date) return null;

    const dueDate = parseISO(task.due_date);
    const dateStr = format(dueDate, "MMM d, yyyy");

    if (isCompleted) {
      return dateStr;
    }

    if (isToday(dueDate)) {
      return `Due today (${dateStr})`;
    }

    if (isPast(dueDate)) {
      return `Overdue: ${dateStr}`;
    }

    return `Due: ${dateStr}`;
  };

  const dueDateLabel = getDueDateLabel();
  const isOverdue = task.due_date && !isCompleted && isPast(parseISO(task.due_date));

  return (
    <div
      className={`rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg ${
        isCompleted ? "opacity-60" : ""
      } ${isOverdue ? "border-2 border-red-300" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={onToggleComplete}
          className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
        />

        {/* Task Content */}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3 flex-wrap">
            <h3
              className={`text-lg font-semibold ${
                isCompleted ? "line-through text-gray-500" : "text-gray-900"
              }`}
            >
              {task.title}
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${assigneeColors[task.assigned_to]}`}
            >
              {assigneeLabels[task.assigned_to]}
            </span>
          </div>

          {dueDateLabel && (
            <p
              className={`text-sm ${
                isOverdue ? "font-semibold text-red-600" : "text-gray-600"
              }`}
            >
              📅 {dueDateLabel}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

