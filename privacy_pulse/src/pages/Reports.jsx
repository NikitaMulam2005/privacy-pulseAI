import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { FileDown } from "lucide-react";
import NeonCard from "../components/NeonCard";
import { motion } from "framer-motion";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [search, setSearch] = useState("");
  const [viewReport, setViewReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("https://privacypulse-backend.onrender.com/api/dashboard/history");
        const data = await res.json();

        const formatted = data.map((doc) => ({
          id: doc._id.$oid,
          date: new Date(doc.created_at).toLocaleDateString(),
          domain: new URL(doc.url).hostname,
          score: doc.score,
          shared: doc.score + "%",
          risk: doc.classification,
          status: doc.score > 50 ? "Flagged" : "Reviewed",
          cookies: doc.cookies || [],
          trackers: doc.trackers || [],
          raw: doc,
        }));

        setReports(formatted);
        setFilteredReports(formatted);

        // Metrics
        const totalScore = data.reduce((acc, doc) => acc + doc.score, 0);
        const avgScore = data.length ? Math.round(totalScore / data.length) : 0;

        setMetrics([
          { title: "Privacy Score", value: avgScore + "%", color: "from-cyan-400 to-blue-400" },
          { title: "Data Shared", value: Math.round(100 - avgScore) + "%", color: "from-yellow-400 to-orange-400" },
          { title: "Third-Party Trackers", value: data.filter(d => d.trackers.length).length, color: "from-purple-400 to-pink-400" },
          { title: "Cookies Detected", value: data.filter(d => d.cookies.length).length, color: "from-green-400 to-emerald-400" },
          { title: "High Risk Sites", value: data.filter(d => d.score > 50).length, color: "from-red-400 to-rose-500" },
        ]);

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Search filter
  useEffect(() => {
    if (!search) return setFilteredReports(reports);
    const filtered = reports.filter(r =>
      r.domain.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredReports(filtered);
  }, [search, reports]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("PrivacyPulse AI — Site Report", 14, 22);
    let y = 36;
    filteredReports.forEach((r) => {
      const lines = doc.splitTextToSize(`Site: ${r.domain} | Score: ${r.shared} | Risk: ${r.risk}`, 180);
      doc.text(lines, 14, y);
      y += lines.length * 6 + 4;
      if (y > 280) { doc.addPage(); y = 20; }
    });
    doc.save("privacypulse-report.pdf");
  };

  const visibleReports = filteredReports.slice(0, 10);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-950">
        <div className="w-16 h-16 border-4 border-cyan-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-950 text-white font-orbitron p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="pl-3">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
            Reports
          </h1>
          <p className="text-gray-400 mt-2 text-sm max-w-lg">
            Weekly AI-analyzed reports on site privacy performance.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(0,255,255,0.4)" }}
          onClick={generatePDF}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-cyan-400 to-blue-400 text-gray-900 font-semibold transition"
        >
          <FileDown size={16} /> Generate PDF
        </motion.button>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pl-3">
        {metrics.map((m, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(0,255,255,0.3)" }}
            className="p-4 rounded-2xl bg-gray-800/70 border border-gray-700 hover:shadow-lg transition"
          >
            <h4 className="text-gray-400 text-sm mb-1">{m.title}</h4>
            <p
              className={`text-2xl font-bold bg-gradient-to-r ${m.color} bg-clip-text text-transparent`}
            >
              {m.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Report Table */}
      <NeonCard className="overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-blue-300">Recent Reports</h3>
          <input
            type="text"
            placeholder="Search reports..."
            className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800 text-gray-300 sticky top-0">
              <tr>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Domain</th>
                <th className="py-3 px-6">Score</th>
                <th className="py-3 px-6">Risk Level</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleReports.map((r) => (
                <motion.tr
                  key={r.id}
                  whileHover={{ backgroundColor: "rgba(0,255,255,0.05)" }}
                  className="border-t border-gray-800 transition"
                >
                  <td className="py-3 px-6">{r.date}</td>
                  <td className="py-3 px-6">{r.domain}</td>
                  <td className="py-3 px-6 text-cyan-300">{r.shared}</td>
                  <td
                    className={`py-3 px-6 font-semibold ${
                      r.risk === "High"
                        ? "text-red-400"
                        : r.risk === "Medium"
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {r.risk}
                  </td>
                  <td className="py-3 px-6 text-gray-300">{r.status}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => setViewReport(r)}
                      className="px-3 py-1 text-xs bg-gray-700/60 border border-gray-600 rounded-md hover:bg-gray-700/80 transition"
                    >
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeonCard>

      {/* View Modal */}
      {viewReport && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-3xl w-full overflow-auto max-h-[80vh]">
            <h2 className="text-lg font-semibold text-blue-400 mb-4">{viewReport.domain}</h2>
            <p className="mb-2 text-gray-300"><strong>Score:</strong> {viewReport.score}%</p>
            <p className="mb-2 text-gray-300"><strong>Risk:</strong> {viewReport.risk}</p>
            <p className="mb-2 text-gray-300"><strong>Cookies:</strong> {viewReport.cookies.join(", ") || "None"}</p>
            <p className="mb-2 text-gray-300"><strong>Trackers:</strong> {viewReport.trackers.join(", ") || "None"}</p>
            <p className="mb-2 text-gray-300"><strong>Raw Data:</strong></p>
            <pre className="text-xs bg-gray-800 p-2 rounded max-h-48 overflow-y-auto">{JSON.stringify(viewReport.raw, null, 2)}</pre>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600 transition"
                onClick={() => setViewReport(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
