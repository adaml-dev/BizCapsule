import React, { ReactNode } from "react";

export default function FormWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-md p-8 rounded-2xl border border-gray-800/30 bg-gray-900/40 backdrop-blur-lg shadow-xl">
      {children}
    </div>
  );
}
