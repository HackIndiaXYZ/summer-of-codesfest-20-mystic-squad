import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ icon: Icon, label, value, trend, isPositive }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (start === end) {
      setDisplayValue(value);
      return;
    }
    const duration = 1000;
    const incrementTime = 20;
    const step = Math.ceil(end / (duration / incrementTime));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 md:p-6 rounded-2xl flex flex-col gap-4 relative group hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start relative z-10">
        <div className="p-2.5 bg-zinc-800 border border-zinc-700 rounded-xl">
          <Icon className="w-5 h-5 text-zinc-300" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full border ${
              isPositive
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {trend}
          </div>
        )}
      </div>
      <div className="relative z-10 mt-2">
        <div className="text-3xl md:text-4xl font-semibold text-zinc-100 mb-1 tracking-tight">
          {displayValue}
        </div>
        <div className="text-xs font-medium text-zinc-500">{label}</div>
      </div>
    </div>
  );
}
