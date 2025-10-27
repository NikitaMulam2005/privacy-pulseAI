import React, { useState } from "react";
import { motion } from "framer-motion";
import NeonCard from "../components/NeonCard";

export default function Compare() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const [A, setAData] = useState(null);
  const [B, setBData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSiteData = async (url, setter) => {
    try {
      const res = await fetch("https://privacypulse-backend.onrender.com/api/scan/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      const data = await res.json();

      setter({
        url: data.url,
        score: data.score,
        sharing: data.classification,
        trackers: data.trackers?.length || "Unknown",
        summary: data.summary || "No summary available"
      });
    } catch (error) {
      console.error("Scan error:", error);
      setter(null);
    }
  };

  const handleCompare = async () => {
    setLoading(true);
    await Promise.all([fetchSiteData(a, setAData), fetchSiteData(b, setBData)]);
    setLoading(false);
  };

  const transparencyDiff = A && B ? Math.abs(B.score - A.score) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white font-orbitron">
      <div className="flex-1 p-6 w-full max-w-[70%] mx-auto flex flex-col gap-8">

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-100 tracking-wide">Privacy Compare</h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Compare transparency and privacy metrics of two websites instantly.
          </p>
        </div>

        {/* Input Fields */}
        <NeonCard className="flex flex-col gap-6 p-6 bg-gray-800/40 border border-gray-700 rounded-2xl transition-all hover:shadow-lg w-full">
          <input
            value={a}
            onChange={(e) => setA(e.target.value)}
            placeholder="Site A"
            className="w-full p-4 rounded-2xl bg-gray-700/30 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition"
          />

          <input
            value={b}
            onChange={(e) => setB(e.target.value)}
            placeholder="Site B"
            className="w-full p-4 rounded-2xl bg-gray-700/30 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition"
          />

          <button
            onClick={handleCompare}
            disabled={loading}
            className="p-3 rounded-xl bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Compare"}
          </button>
        </NeonCard>

        {/* Loading */}
        {loading && (
          <div className="text-center text-cyan-300 text-lg animate-pulse">
            Analyzing websites securely...
          </div>
        )}

        {/* Comparison Panel */}
        {A && B && (
          <NeonCard className="p-6 space-y-8 bg-gray-800/40 border border-gray-700 rounded-2xl transition-all hover:shadow-lg flex flex-col w-full">

            {/* Site A */}
            <div className="flex flex-col items-center gap-2 text-center w-full">
              <div className="font-bold text-cyan-300 text-lg md:text-xl">{A.url}</div>
              <div className="text-gray-200 mt-1">Score: <span className="font-bold">{A.score}%</span></div>
              <div className="text-gray-400 text-sm mt-1">{A.summary}</div>
            </div>

            {/* Comparison Bar */}
            <div className="w-full h-6 rounded-full bg-gray-700/30 overflow-hidden flex">
              <motion.div
                className="h-full bg-cyan-300"
                initial={{ width: 0 }}
                animate={{ width: `${A.score}%` }}
                transition={{ duration: 0.8 }}
              />
              <motion.div
                className="h-full bg-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${B.score}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <div className="text-gray-400 text-xs text-center mt-1">
              {B.score > A.score
                ? `${b} is ${transparencyDiff}% more transparent`
                : `${a} is ${transparencyDiff}% more transparent`}
            </div>

            {/* Site B */}
            <div className="flex flex-col items-center gap-2 text-center w-full">
              <div className="font-bold text-blue-300 text-lg md:text-xl">{B.url}</div>
              <div className="text-gray-200 mt-1">Score: <span className="font-bold">{B.score}%</span></div>
              <div className="text-gray-400 text-sm mt-1">{B.summary}</div>
            </div>

            {/* Detailed Info */}
            <div className="flex flex-col gap-6 mt-6 w-full">
              {[A, B].map((site, idx) => (
                <div key={idx} className="space-y-3 w-full">
                  <div className="text-center font-bold text-gray-100 text-base">
                    {idx === 0 ? a : b} Details
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(0,255,255,0.3)" }}
                    className="bg-gray-700/30 p-4 rounded-xl space-y-3 border-l-4 border-cyan-300 hover:border-blue-300 transition w-full"
                  >
                    <div className="text-gray-400 text-sm">Data Collected</div>
                    <div className="font-semibold text-gray-100">
                      {site.score > 80 ? "Minimal" : "Personal & Identifiers"}
                    </div>

                    <div className="text-gray-400 text-sm">Third-party Sharing</div>
                    <div className="font-semibold text-gray-100">{site.sharing}</div>

                    <div className="text-gray-400 text-sm">Trackers</div>
                    <div className="font-semibold text-gray-100">{site.trackers}</div>
                  </motion.div>
                </div>
              ))}
            </div>
          </NeonCard>
        )}
      </div>

      {/* Footer Guidance */}
      <footer className="w-full p-4 border-t border-white/10 text-white/70 text-sm space-y-1 bg-gray-900">
        <h4 className="font-semibold mb-1">Compare Page Guidance:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Enter multiple URLs to see their privacy scores side by side.</li>
          <li>Red flags indicate weak privacy practices, tracking scripts, or potential leaks.</li>
          <li>Warning: Don’t assume higher traffic websites are safer.</li>
          <li>Focus on sites with better encryption and minimal trackers.</li>
          <li>Use this comparison to make informed decisions on which sites to use for sensitive activities.</li>
        </ul>
      </footer>
    </div>
  );
}
