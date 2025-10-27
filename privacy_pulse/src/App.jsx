import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopNav from "./components/TopNav";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import Compare from "./pages/Compare";
import Awareness from "./pages/Awareness";
import Reports from "./pages/Reports";


export default function App() {
  useEffect(() => {
    // ensure dark theme class exists for cyber theme
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <div className="flex flex-1 pt-16">
          <Sidebar />
          <main className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/analyze" element={<Analyze />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/awareness" element={<Awareness />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
