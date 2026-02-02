"use client";

interface AnimatedRasnaProps {
  className?: string;
}

export default function AnimatedRasna({
  className = "",
}: AnimatedRasnaProps) {
  // Check if className contains a text size override
  const hasTextSize = className.includes("text-");
  
  return (
    <span
      className={`font-bold ${!hasTextSize ? "text-5xl" : ""} animated-rasna ${className}`}
    >
      FAMPO
    </span>
  );
}

