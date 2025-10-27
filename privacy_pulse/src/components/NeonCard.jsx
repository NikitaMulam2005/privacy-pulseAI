import React from "react";

export default function NeonCard({ children, className="" }) {
  return (
    <div className={`glass p-4 rounded-2xl border border-white/6 shadow-neon ${className}`}>
      {children}
    </div>
  );
}