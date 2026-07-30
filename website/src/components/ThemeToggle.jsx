"use client";
import { useState, useEffect } from "react";
import { Sun, Moon, Sparkles } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("echogaze-theme") || "dark";
    setTheme(saved);
    if (saved === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("echogaze-theme", next);
    if (next === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative px-4 py-2 rounded-full bg-black/20 dark:bg-white/10 hover:bg-black/30 dark:hover:bg-white/20 border border-white/5 shadow-inner transition-all flex items-center gap-2 group active:scale-95"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Theme`}
      aria-label="Toggle Light and Dark Theme"
    >
      <div className="flex items-center gap-2 relative z-10">
        {theme === "dark" ? (
          <>
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-xs font-semibold text-white tracking-widest uppercase hidden md:inline">
              Light
            </span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
            <span className="text-xs font-semibold text-black tracking-widest uppercase hidden md:inline">
              Dark
            </span>
          </>
        )}
      </div>
    </button>
  );
}
