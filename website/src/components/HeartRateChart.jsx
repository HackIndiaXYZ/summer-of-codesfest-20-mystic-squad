"use client";
import { useState, useEffect } from "react";
import { Heart, Activity, TrendingUp, AlertCircle, ShieldCheck } from "lucide-react";

export default function HeartRateChart() {
  const [bpm, setBpm] = useState(74);
  const [history, setHistory] = useState([72, 74, 73, 76, 75, 74, 78, 74, 72, 75, 74]);
  const [isPulse, setIsPulse] = useState(false);

  // Live heart rate telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.48) * 3;
      const nextBpm = Math.max(60, Math.min(110, Math.round(bpm + delta)));
      setBpm(nextBpm);
      setHistory((prev) => [...prev.slice(1), nextBpm]);

      setIsPulse(true);
      setTimeout(() => setIsPulse(false), 300);
    }, 1200);

    return () => clearInterval(interval);
  }, [bpm]);

  const minBpm = Math.min(...history);
  const maxBpm = Math.max(...history);
  const avgBpm = Math.round(history.reduce((a, b) => a + b, 0) / history.length);

  // SVG Chart path calculation
  const width = 400;
  const height = 120;
  const points = history.map((val, idx) => {
    const x = (idx / (history.length - 1)) * width;
    const y = height - ((val - 50) / 70) * height;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(" L ")}`;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full relative overflow-hidden group hover:border-zinc-700 transition-colors">

      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-4 relative z-10">
            <span className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700">
              <Heart className={`w-5 h-5 ${isPulse ? "scale-110 text-red-500" : "text-red-400"} transition-transform duration-150`} />
            </span>
            <div>
              <h3 className="font-semibold text-zinc-100 text-base">Heart Rate</h3>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Live Telemetry (PPG)</p>
            </div>
          </div>
        </div>

        <div className="text-right relative z-10">
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-4xl font-semibold text-zinc-100">
              {bpm}
            </span>
            <span className="text-xs font-medium text-zinc-500">BPM</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium mt-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Normal Rhythm
          </span>
        </div>
      </div>

      {/* Live Waveform Chart */}
      <div className="my-3 relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
          {/* Gradient Fill */}
          <defs>
            <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path
            d={`${pathD} L ${width},${height} L 0,${height} Z`}
            fill="url(#hrGradient)"
          />

          {/* Line Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="#EF4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current point pulsing dot */}
          {history.length > 0 && (
            <circle
              cx={width}
              cy={height - ((history[history.length - 1] - 50) / 70) * height}
              r="5"
              fill="#EF4444"
              className="animate-ping"
            />
          )}
        </svg>
      </div>

      {/* Footer Stats Grid */}
      <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-800 text-center relative z-10">
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
          <span className="text-zinc-500 block text-xs mb-1 font-medium">Min</span>
          <span className="font-semibold text-zinc-200 text-lg">{minBpm}</span>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
          <span className="text-zinc-500 block text-xs mb-1 font-medium">Avg</span>
          <span className="font-semibold text-zinc-200 text-lg">{avgBpm}</span>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
          <span className="text-zinc-500 block text-xs mb-1 font-medium">Max</span>
          <span className="font-semibold text-zinc-200 text-lg">{maxBpm}</span>
        </div>
      </div>
    </div>
  );
}
