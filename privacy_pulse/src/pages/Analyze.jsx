import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NeonCard from "../components/NeonCard";
import ScoreRing from "../components/ScoreRing";

// Loader animation
function FakeScanAnimation({ running }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (running) {
      setProgress(0);
      interval = setInterval(() => setProgress((prev) => (prev >= 100 ? 100 : prev + 1.5)), 25);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [running]);

  return (
    <div className="w-full h-16 flex flex-col items-center justify-center gap-1">
      <div className="relative w-full max-w-xl h-12 rounded-xl overflow-hidden bg-gray-800/50 border border-cyan-500/20 shadow-inner">
        <motion.div
          animate={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-neonteal to-neonblue blur-sm opacity-70 rounded-xl"
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs md:text-sm text-white/70 font-medium tracking-wide">
          {running ? `Scanning… ${Math.floor(progress)}%` : "Scan complete"}
        </div>
      </div>
    </div>
  );
}

export default function Analyze() {
  const [url, setUrl] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState({
    summary: "",
    score: 0,
    bullets: [],
    highlights: [],
    policy: [],
    tone: "unknown",
    risks: [],
  });
  const [expanded, setExpanded] = useState({});
  const [warning, setWarning] = useState("");
  const [showFullSummary, setShowFullSummary] = useState(false);

  // Block navigation while scanning
  useEffect(() => {
    const handleClick = (e) => {
      if (running) e.preventDefault();
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [running]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (running) {
        e.preventDefault();
        e.returnValue = "Scan in progress! Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [running]);

  // Function to clean repetitive text
  const cleanRepetitiveText = (text) => {
    // Detect repeated phrases like "Privacy & Terms"
    const pattern = /(Privacy & Terms\s*)+/;
    if (pattern.test(text)) {
      // Replace multiple occurrences with a single instance
      text = text.replace(pattern, "Privacy & Terms ");
    }
    // Trim excessive whitespace and limit length
    return text.trim().slice(0, 1000); // Limit to 1000 chars to prevent UI issues
  };

  const doScan = async () => {
    if (!url) return;
    setRunning(true);
    setWarning("");
    setShowFullSummary(false);
    setResult({
      summary: "",
      score: 0,
      bullets: [],
      highlights: [],
      policy: [],
      tone: "unknown",
      risks: [],
    });

    try {
      const res = await fetch("https://privacypulse-backend.onrender.com/api/scan/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      if (!res.body) {
        const text = await res.text();
        const cleanedText = cleanRepetitiveText(text || "No data returned from server.");
        setResult((prev) => ({
          ...prev,
          summary: cleanedText,
        }));
        setWarning("⚠️ Received empty or invalid response from server.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let isJson = false;

      // Check if response is JSON by looking at Content-Type
      const contentType = res.headers.get("Content-Type") || "";
      if (contentType.includes("application/json")) {
        isJson = true;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        // Update UI with partial data, cleaned of repetition
        setResult((prev) => ({
          ...prev,
          summary: cleanRepetitiveText(accumulated),
        }));
      }

      // Process the final accumulated response
      if (isJson) {
        try {
          // Attempt to parse as JSON
          const parsed = JSON.parse(accumulated);
          setResult({
            score: parsed.score ?? 0,
            summary: cleanRepetitiveText(parsed.summary ?? accumulated),
            bullets: parsed.bullets ?? [],
            highlights: parsed.highlights ?? [],
            policy: parsed.policy ?? [],
            tone: parsed.tone ?? "unknown",
            risks: parsed.risks ?? [],
          });
        } catch (jsonError) {
          // Handle incomplete or malformed JSON
          console.warn("Failed to parse JSON:", jsonError);

          // Attempt to extract partial JSON
          try {
            let fixedJson = accumulated;
            if (!fixedJson.endsWith("}")) {
              fixedJson += "}";
            }
            if (fixedJson.includes('[') && !fixedJson.endsWith("]")) {
              fixedJson += "]";
            }
            const parsedPartial = JSON.parse(fixedJson);
            setResult({
              score: parsedPartial.score ?? 0,
              summary: cleanRepetitiveText(parsedPartial.summary ?? accumulated),
              bullets: parsedPartial.bullets ?? [],
              highlights: parsedPartial.highlights ?? [],
              policy: parsedPartial.policy ?? [],
              tone: parsedPartial.tone ?? "unknown",
              risks: parsedPartial.risks ?? [],
            });
          } catch (partialError) {
            // If JSON parsing fails, treat as text
            setResult((prev) => ({
              ...prev,
              summary: cleanRepetitiveText(accumulated),
            }));
            setWarning("⚠️ Received incomplete or malformed JSON. Displaying cleaned text.");
          }
        }
      } else {
        // Handle plain text response
        const cleanedText = cleanRepetitiveText(accumulated);
        setResult((prev) => ({
          ...prev,
          summary: cleanedText,
        }));
        if (!cleanedText.endsWith(".")) {
          setWarning("⚠️ Response appears incomplete.");
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setResult({
        score: 0,
        summary: "Failed to fetch scan results",
        bullets: [],
        highlights: [],
        policy: [],
        tone: "unknown",
        risks: [],
      });
      setWarning("⚠️ An error occurred while fetching scan results.");
    } finally {
      setRunning(false);
    }
  };

  const toggleSection = (idx) => setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const getHighlightColor = (level) => {
    switch (level) {
      case "high":
        return "bg-red-500/30 border-red-400 text-red-300";
      case "medium":
        return "bg-yellow-500/20 border-yellow-400 text-yellow-300";
      default:
        return "bg-green-500/20 border-green-400 text-green-300";
    }
  };

  // Truncate summary for display
  const MAX_SUMMARY_LENGTH = 500;
  const truncatedSummary =
    result.summary.length > MAX_SUMMARY_LENGTH && !showFullSummary
      ? result.summary.slice(0, MAX_SUMMARY_LENGTH) + "..."
      : result.summary;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-black via-gray-900 to-black text-white space-y-8 pointer-events-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-2"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
          AI Scanner
        </h1>
        <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto">
          Analyze any website’s privacy practices with our AI-powered scanner.
        </p>
      </motion.header>

      {/* URL Input */}
      <div className="flex flex-col md:flex-row gap-4 items-center max-w-3xl mx-auto">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website (example.com)"
          className="flex-1 p-3 rounded-xl bg-gray-800/50 border border-cyan-500/20 text-white/90 placeholder-white/50 shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          disabled={running}
        />
        <button
          onClick={doScan}
          disabled={running || !url}
          className={`px-6 py-3 rounded-xl bg-gradient-to-tr from-neonteal to-neonblue text-white font-semibold shadow-lg hover:scale-105 transition-transform hover:shadow-neonblue/50 ${
            running ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {running ? "Scanning..." : "Run Scan"}
        </button>
      </div>

      {/* Warning */}
      {warning && <div className="text-yellow-400 text-sm max-w-3xl mx-auto">{warning}</div>}

      {/* Scan & Results */}
      <NeonCard className="max-w-5xl mx-auto p-6 space-y-6">
        <FakeScanAnimation running={running} />

        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-3 gap-6 items-start"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="text-xs text-white/60 font-medium">Transparency Score</div>
              <ScoreRing score={result.score} />
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="text-sm font-semibold text-cyan-400">AI Summary</div>
              <div className="text-white/80 text-[14px] leading-relaxed whitespace-pre-wrap">
                {truncatedSummary || "No summary available."}
                {result.summary.length > MAX_SUMMARY_LENGTH && (
                  <button
                    onClick={() => setShowFullSummary(!showFullSummary)}
                    className="text-cyan-400 text-sm mt-2 hover:underline"
                  >
                    {showFullSummary ? "Show Less" : "Show More"}
                  </button>
                )}
                {warning && <span className="text-yellow-400 text-sm block mt-2">{warning}</span>}
              </div>

              {result.bullets?.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-semibold text-cyan-400">Key Points</div>
                  <ul className="list-disc list-inside text-white/70 text-[13px]">
                    {result.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-3">
                {result.highlights?.map((h, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex flex-col gap-1 ${getHighlightColor(
                      h.level
                    )} hover:border-neonblue transition`}
                  >
                    <div className="text-[11px] font-semibold">{h.category}</div>
                    <div className="font-bold">{h.status}</div>
                    <div className="text-[12px] text-white/50">{h.example}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {!running && !result.summary && (
          <div className="text-sm text-white/60 italic">
            No scan results yet. Run a scan to see the policy breakdown highlighting data collection, sharing, trackers, and risky clauses.
          </div>
        )}
      </NeonCard>

      {/* Collapsible Policy Card */}
      {result.policy?.length > 0 && (
        <NeonCard className="max-w-4xl mx-auto p-6 bg-gray-900/70 border border-gray-800 rounded-xl">
          <div className="text-lg font-bold text-white mb-4">Detailed Policy (AI-parsed)</div>
          <div className="space-y-4 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-neonblue/40 scrollbar-track-gray-900/20">
            {result.policy.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-800/50 rounded-lg border-l-4 border-cyan-500 hover:border-neonblue cursor-pointer transition-all"
                onClick={() => toggleSection(idx)}
              >
                <div className="p-4 flex justify-between items-center">
                  <div className="font-semibold text-white">{item.title}</div>
                  <div className="text-cyan-300 text-sm">{expanded[idx] ? "−" : "+"}</div>
                </div>
                {expanded[idx] && (
                  <div className="px-4 pb-4 text-[13px] text-white/70 leading-relaxed">{item.description}</div>
                )}
              </div>
            ))}
          </div>
        </NeonCard>
      )}

      {/* Guidance */}
      <div className="w-full mt-6 p-4 border-t border-white/10 text-white/70 text-sm space-y-2 max-w-4xl mx-auto">
        <h4 className="font-semibold mb-1">Analyze Page Guidance:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Enter the full website URL including "https://".</li>
          <li>Scan results show trackers, privacy score, potential data leaks, and key policy points.</li>
          <li>All navigation is blocked while scan is running.</li>
          <li>Take action on sites with low privacy scores by avoiding personal data submission.</li>
          <li>Use this page regularly to verify website privacy compliance before sharing sensitive info.</li>
        </ul>
      </div>
    </div>
  );
}