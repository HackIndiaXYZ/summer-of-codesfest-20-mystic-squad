"use client";
import { TrendingUp, Activity, Award, CheckCircle2, ChevronRight, Zap } from "lucide-react";

export default function RecoveryProgress() {
  const metrics = [
    { label: "Selection Latency", value: "1.1 sec", sub: "-0.3s vs last week", positive: true },
    { label: "Daily Intent Score", value: "94 / 100", sub: "+8 points gain", positive: true },
    { label: "Motor Consistency", value: "98%", sub: "Minimal jitter", positive: true },
    { label: "Speech Readouts", value: "48 total", sub: "Active engagement", positive: true }
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full relative overflow-hidden group hover:border-zinc-700 transition-colors">

      {/* Card Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100 text-base">Recovery Progress</h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">Motor Efficiency Metrics</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" /> Stage II Stable
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-zinc-950 border border-zinc-800"
          >
            <span className="text-xs text-zinc-500 block mb-2 font-medium">{m.label}</span>
            <div className="text-2xl md:text-3xl font-semibold text-zinc-100">{m.value}</div>
            <span className={`text-xs font-medium mt-2 block ${m.positive ? "text-emerald-400" : "text-red-400"}`}>
              {m.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Recovery Milestone Bar */}
      <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 relative z-10">
        <div className="flex justify-between items-center text-xs font-medium mb-3">
          <span className="text-zinc-400">Motor Recovery Goal</span>
          <span className="text-emerald-400">84% Completed</span>
        </div>
        <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="bg-emerald-500 h-full rounded-full"
            style={{ width: "84%" }}
          />
        </div>
      </div>
    </div>
  );
}
