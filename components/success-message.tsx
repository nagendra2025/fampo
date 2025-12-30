"use client";

import { useEffect, useState } from "react";

interface SuccessMessageProps {
  message: string;
  onClose?: () => void;
  duration?: number;
}

export default function SuccessMessage({
  message,
  onClose,
  duration = 2000,
}: SuccessMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Wait for fade-out animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 transform transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      <div className="rounded-lg bg-green-50 border border-green-200 px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-green-800">{message}</p>
        </div>
      </div>
    </div>
  );
}

