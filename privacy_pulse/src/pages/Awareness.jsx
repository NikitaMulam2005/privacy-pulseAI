import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NeonCard from "../components/NeonCard";

export default function Awareness() {
  const [dailyTip, setDailyTip] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("https://privacypulse-backend.onrender.com/awareness/");
        const json = await res.json();
        if (json.status === "success") {
          const data = json.data;
          setDailyTip(data.daily_tip || null);
          setQuiz(data.quiz || []);
          setLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        console.error("Error fetching awareness content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const submit = (idx, val) => setAnswers((prev) => ({ ...prev, [idx]: val }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-cyan-300 font-orbitron">
        Loading Privacy Awareness content...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-8 flex flex-col gap-10 max-w-6xl mx-auto font-orbitron text-gray-100">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide drop-shadow-sm">
          Privacy Awareness Hub
        </h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">
          Learn, play, and lead — strengthen your online privacy intelligence every day.
        </p>
      </div>

      {/* Daily Tip */}
      {dailyTip && (
        <motion.div whileHover={{ scale: 1.03 }} className="transition-all duration-300">
          <NeonCard className="p-5 bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-md hover:shadow-cyan-500/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                  💡 Daily Privacy Tip
                </div>
                <div className="mt-2 text-sm text-gray-300 leading-relaxed">
                  {dailyTip}
                </div>
              </div>
              <div className="text-xs md:text-sm text-gray-400 italic">Updated daily</div>
            </div>
          </NeonCard>
        </motion.div>
      )}

      {/* Quiz Section */}
      <div className="grid md:grid-cols-3 gap-8">

        <NeonCard className="col-span-2 p-6 bg-gray-800/60 border border-gray-700/60 rounded-2xl shadow-md hover:shadow-cyan-400/10 transition-all duration-300">
          <div className="text-xl font-bold text-cyan-300 mb-5 flex items-center gap-2">
            🧠 Quiz: Spot the Risk
          </div>

          <div className="space-y-5">
            {quiz.map((q, i) => (
              <div
                key={i}
                className="p-4 bg-gray-700/30 border border-gray-600/40 rounded-xl transition-all duration-200 hover:bg-gray-700/50"
              >
                <div className="text-sm text-gray-200 mb-3">{q.q}</div>
                <div className="flex gap-3">
                  {["Yes", "No", "Depends"].map((opt) => {
                    const isSelected = answers[i] === opt;
                    const isCorrect = opt === q.a;
                    let classes = "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 backdrop-blur-sm";

                    if (isSelected) {
                      classes += isCorrect
                        ? " bg-green-500 text-gray-900 shadow-md shadow-green-400/50"
                        : " bg-red-500 text-gray-900 shadow-md shadow-red-400/50";
                    } else {
                      classes += " bg-gray-600/20 border border-gray-500/40 text-gray-300 hover:bg-gray-600/40 hover:shadow-cyan-400/20";
                    }

                    return (
                      <motion.button
                        key={opt}
                        onClick={() => submit(i, opt)}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(0,255,255,0.5)" }}
                        className={classes}
                      >
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Score Tracker */}
          <div className="mt-6 text-center text-sm text-gray-400">
            {Object.keys(answers).length === 0 ? (
              "Answer the quiz to see your privacy awareness score."
            ) : (
              <div>
                <span className="text-cyan-300 font-semibold">{Object.keys(answers).length}</span>{" "}
                / {quiz.length} questions answered
              </div>
            )}
          </div>
        </NeonCard>

        {/* Leaderboard Section */}
        <NeonCard className="p-6 bg-gray-800/60 border border-gray-700/60 rounded-2xl shadow-md hover:shadow-blue-400/10 transition-all duration-300">
          <div className="text-xl font-bold text-blue-300 mb-5 flex items-center gap-2">
            🏆 Leaderboard
          </div>
          <div className="space-y-3">
            {leaderboard.map((u, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-gray-700/30 border border-gray-600/40 rounded-xl flex items-center justify-between hover:bg-gray-700/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">#{i + 1}</span>
                  <span className="text-gray-200 font-semibold">{u.name}</span>
                </div>
                <div className="font-bold text-cyan-300">{u.score}%</div>
              </motion.div>
            ))}
          </div>
        </NeonCard>

      </div>

      {/* Footer Guidance */}
      <div className="w-full mt-6 p-4 border-t border-white/10 text-white/70 text-sm">
        <h4 className="font-semibold mb-2">Privacy Awareness Tips:</h4>
        <div className="flex flex-col gap-1">
          <span>• Read the latest privacy news and threat alerts regularly.</span>
          <span>• Be aware of phishing attempts and suspicious links.</span>
          <span>• Warning: Clicking unknown links or downloading unverified files can compromise your security.</span>
          <span>• Enable two-factor authentication wherever possible.</span>
          <span>• Regularly clear cookies and browser cache to reduce tracking.</span>
        </div>
      </div>

    </div>
  );
}
