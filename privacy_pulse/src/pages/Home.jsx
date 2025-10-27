import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { Shield, Globe, Activity } from "lucide-react";
import { useLocation } from "react-router-dom";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function Home() {
  const location = useLocation();
  const [zoom, setZoom] = useState(1);
  const [policyData, setPolicyData] = useState([]);
  const [stats, setStats] = useState({
    websitesAnalyzed: 0,
    averageScore: 0,
    totalCookies: 0,
  });

  useEffect(() => {
    fetch("https://privacypulse-backend.onrender.com/api/dashboard/history")
      .then((res) => res.json())
      .then((data) => {
        const arrData = Array.isArray(data) ? data : [data];
        setPolicyData(arrData);

        const websitesAnalyzed = arrData.length;
        const avgScore =
          arrData.reduce((sum, item) => sum + (item.score || 0), 0) /
          (websitesAnalyzed || 1);
        const totalCookies = arrData.reduce(
          (sum, item) => sum + (item.cookies ? item.cookies.length : 0),
          0
        );

        setStats({
          websitesAnalyzed,
          averageScore: Math.round(avgScore),
          totalCookies,
        });
      })
      .catch((err) => console.error("Error fetching dashboard data:", err));
  }, [location]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 1));

  const mapStats = [
    { title: "Total Threats", value: policyData.length, icon: Activity },
    {
      title: "High-Risk Countries",
      value: policyData.filter((t) => t.classification !== "Safe").length,
      icon: Shield,
    },
    {
      title: "Safe Countries",
      value: policyData.filter((t) => t.classification === "Safe").length,
      icon: Globe,
    },
  ];

  const markers = policyData
    .map((item) => {
      if (!item.geo || !item.geo.latitude || !item.geo.longitude) return null;

      let lat = item.geo.latitude;
      let lon = item.geo.longitude;

      const jitter = 0.3;
      lat += (Math.random() - 0.5) * jitter;
      lon += (Math.random() - 0.5) * jitter;

      return {
        name: item.geo.city || item.geo.country || "Unknown",
        coordinates: [lon, lat],
        risk: item.classification === "Safe" ? "Low" : "High",
        url: item.url || "Unknown",
        classification: item.classification || "Unknown",
        score: item.score != null ? item.score : "N/A",
      };
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-8">
      {/* Header */}
      <header className="text-center space-y-3 mb-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500"
        >
          PrivacyPulse AI 🌐
        </motion.h1>
        <p className="text-white/70 max-w-2xl mx-auto text-sm">
          Global privacy intelligence — AI-powered insights, real-time scanning, and tracker detection.
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[
          { title: "Websites Analyzed", value: stats.websitesAnalyzed, icon: Globe },
          { title: "Average Privacy Score", value: stats.averageScore, icon: Shield },
          { title: "Total Cookies", value: stats.totalCookies, icon: Activity },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-to-tr from-gray-800/60 to-gray-900/80 rounded-2xl p-6 border border-cyan-500/20 shadow-lg hover:shadow-cyan-500/30 transition"
          >
            <div className="flex items-center gap-3">
              <card.icon className="text-cyan-400" size={24} />
              <div>
                <div className="text-sm text-white/60">{card.title}</div>
                <div className="text-2xl font-bold mt-1">{card.value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* World Map */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="rounded-2xl overflow-hidden border border-cyan-500/10 bg-gradient-to-b from-gray-900/70 to-black/90 shadow-inner p-6 mb-8 -mt-12"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="text-cyan-400" /> Global Privacy Pulse
        </h2>

        <div className="mb-3 flex gap-2">
          <button onClick={handleZoomIn} className="px-3 py-1 bg-cyan-500/20 rounded hover:bg-cyan-500/40 transition">
            Zoom In
          </button>
          <button onClick={handleZoomOut} className="px-3 py-1 bg-cyan-500/20 rounded hover:bg-cyan-500/40 transition">
            Zoom Out
          </button>
        </div>

        <div className="w-full h-96">
          <ComposableMap projectionConfig={{ scale: 120 }}>
            <ZoomableGroup zoom={zoom}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#0f172a"
                      stroke="#1e293b"
                      style={{ default: { outline: "none" }, hover: { fill: "#0891b2", outline: "none" } }}
                    />
                  ))
                }
              </Geographies>

              {markers.map(({ name, coordinates, risk, url, classification, score }) => (
                <Marker key={name + Math.random()} coordinates={coordinates}>
                  <circle r={6} fill={risk === "High" ? "#ef4444" : "#22c55e"} stroke="#fff" strokeWidth={0.8} />
                  <title>{`Site: ${url}\nClassification: ${classification}\nScore: ${score}`}</title>
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </motion.section>

      {/* Map Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {mapStats.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-to-tr from-gray-800/60 to-gray-900/80 rounded-2xl p-6 border border-cyan-500/20 shadow-lg hover:shadow-cyan-500/30 transition"
          >
            <div className="flex items-center gap-3">
              <card.icon className="text-cyan-400" size={24} />
              <div>
                <div className="text-sm text-white/60">{card.title}</div>
                <div className="text-2xl font-bold mt-1">{card.value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

    
       <section className="bg-gray-900/60 border border-cyan-500/20 rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="text-cyan-400" /> Recent Scan History
        </h2>

        <div className="max-h-72 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-cyan-600/50 pr-2">
          {policyData.length === 0 && (
            <p className="text-center text-white/50 italic">No scans available yet.</p>
          )}

          {policyData.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{
                scale: 1.02,
                backgroundColor: "rgba(14, 165, 233, 0.08)",
                boxShadow: "0 0 12px rgba(6, 182, 212, 0.3)",
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between bg-gray-800/50 border border-cyan-500/10 rounded-xl p-4 hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="flex flex-col">
                <p className="font-semibold text-cyan-300 truncate max-w-[200px]">{item.url}</p>
                <p className="text-xs text-white/50">
                  {(item.geo?.city && item.geo.city + ", ") || ""}
                  {item.geo?.country || "Unknown"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                    item.classification === "Safe"
                      ? "text-green-400 bg-green-600/10 border border-green-500/30"
                      : "text-red-400 bg-red-600/10 border border-red-500/30"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.classification === "Safe" ? "bg-green-400" : "bg-red-400"
                    }`}
                  />
                  {item.classification}
                </span>

                <span className="text-sm text-white/80">
                  <span className="text-cyan-400">Score:</span> {item.score ?? "N/A"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
   

      {/* Dashboard Tips */}
      <div className="w-full mt-6 p-4 border-t border-white/10 text-white/70 text-sm space-y-2">
        <h4 className="font-semibold mb-1">Dashboard Tips & Warnings:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Monitor real-time threats globally using the map. High-risk countries are marked in red.</li>
          <li>Hover over countries to see details about ongoing threats.</li>
          <li>Check individual site details for cookies, score, and classification.</li>
          <li>Ensure data and alerts are being updated frequently to avoid missing critical threats.</li>
          <li>Warning: Do not rely solely on summary stats; check individual sites for detailed risks.</li>
        </ul>
      </div>
    </div>
  );
}
