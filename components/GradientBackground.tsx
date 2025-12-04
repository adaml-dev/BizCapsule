import React from "react";

export default function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900">
      {/* Subtle overlay pattern for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>
    </div>
  );
}
