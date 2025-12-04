import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-800/30 bg-gray-900/40 backdrop-blur-lg shadow-xl p-6 ${className}`}
    >
      {children}
    </div>
  );
}
