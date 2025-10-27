import React from "react"
import { Link, useLocation } from "react-router-dom"

import { Shield, LayoutDashboard, Activity, BookOpen, FileText,GitCompare } from "lucide-react"

export default function TopNav() {
  const location = useLocation()

  const links = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
    { name: "Analyze", path: "/analyze", icon: <Activity size={18} /> },
    { name: "Compare", path: "/compare", icon: <GitCompare size={18} /> },
    { name: "Awareness", path: "/awareness", icon: <BookOpen size={18} /> },
    { name: "Reports", path: "/reports", icon: <FileText size={18} /> },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-panel/90 backdrop-blur-lg border-b border-cyan-400/20 shadow-neon">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Shield className="text-neon-cyan" size={22} />
          <h1 className="text-lg font-semibold glow">PrivacyPulse AI</h1>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-1 text-sm font-medium transition-all ${
                location.pathname === link.path
                  ? "text-neon-cyan glow"
                  : "text-gray-300 hover:text-neon-cyan"
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-sm text-cyan-300 font-semibold">
            JD
          </div>
      
        </div>
      </div>
    </header>
  )
}
