"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setDark(saved === "dark");
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    setDark(!dark);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return (
    <button onClick={toggle} className="btn btn-icon" title="Toggle theme" style={{ width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0 }}>
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
