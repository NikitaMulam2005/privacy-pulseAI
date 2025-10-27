import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Activity, BarChart2, BookOpen, FileText } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: <Home size={20} /> },
  { to: "/analyze", label: "Analyze", icon: <Activity size={20} /> },
  { to: "/compare", label: "Compare", icon: <BarChart2 size={20} /> },
  { to: "/awareness", label: "Awareness", icon: <BookOpen size={20} /> },
  { to: "/reports", label: "Reports", icon: <FileText size={20} /> },
];

const LinkItem = ({ to, label, icon }) => {
  const loc = useLocation();
  const active = loc.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 py-3 px-3 rounded-md text-sm transition-all duration-300
        ${active ? "bg-white/10 text-white" : "hover:bg-white/5 text-white/80"}
      `}
    >
      {icon}
      <span className="overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
        {label}
      </span>
    </Link>
  );
};

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 z-50 h-screen flex flex-col bg-black/90 border-r border-white/10
      w-16 hover:w-72 transition-all duration-300 overflow-hidden group">
      
      <div className="flex flex-col h-full justify-between">
        {/* Navigation Links */}
        <div className="mt-6 flex flex-col gap-2">
          {links.map((link) => (
            <div className="group" key={link.to}>
              <LinkItem
                to={link.to}
                label={link.label}
                icon={link.icon}
              />
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-6 mb-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Quick Scan */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/60">Quick Scan</span>
            <input
              type="text"
              placeholder="example.com"
              className="w-full p-2 rounded-md bg-transparent border border-white/10 text-white/90 text-sm placeholder-white/50 focus:ring-1 focus:ring-cyan-400 outline-none"
            />
            <button className="w-full px-3 py-2 rounded-md bg-cyan-400 text-black text-sm font-semibold hover:brightness-110 transition">
              Scan
            </button>
          </div>

          {/* Trust Badge */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-white/60">Trust Badge</span>
            <div className="p-3 rounded-md flex items-center justify-between bg-white/5">
              <div>
                <div className="text-sm font-semibold text-white">
                  PrivacyPulse Verified
                </div>
                <div className="text-[11px] text-white/60">
                  Sites with excellent transparency
                </div>
              </div>
              <div className="text-sm font-bold" style={{ color: "#00F0D6" }}>
                ✓
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
