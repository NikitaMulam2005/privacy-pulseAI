import React from "react";

export default function ScoreRing({ score=78, size=96 }) {
  const angle = Math.min(360, Math.max(0, (score/100)*360));
  return (
    <div style={{width:size, height:size}} className="rounded-full flex items-center justify-center">
      <div className="w-full h-full rounded-full flex items-center justify-center" style={{
        background: `conic-gradient(#00F0D6 ${angle}deg, rgba(255,255,255,0.04) ${angle}deg)`,
      }}>
        <div className="w-3/4 h-3/4 rounded-full flex items-center justify-center bg-black/20 text-lg font-semibold">
          {score}%
        </div>
      </div>
    </div>
  );
}
