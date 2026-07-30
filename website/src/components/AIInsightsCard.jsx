"use client";
import { Sparkles, Brain, Clock, Zap, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";

export default function AIInsightsCard() {
  const insights = [
    {
      title: "Peak Request Hours",
      desc: "Patient requests 'Water' 💧 & 'Position Adjust' 🛌 most frequently between 14:00 and 16:00.",
      tag: "Time Pattern",
      icon: Clock,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      title: "Cognitive & Intent Clarity",
      desc: "High consistency in selection speed (1.1s avg response latency), indicating clear intent and low fatigue.",
      tag: "Cognitive Score 96%",
      icon: Zap,
      color: "text-echogaze-accent bg-echogaze-accent/10 border-echogaze-accent/20"
    },
    {
      title: "Proactive Care Recommendation",
      desc: "Schedule pain medication check at 15:30 to preempt recurring pain assistance requests.",
      tag: "Care Plan",
      icon: Brain,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    }
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full relative group hover:border-zinc-700 transition-colors">

      {/* Card Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100 text-base">AI Intent & Insights</h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">Pattern Recognition</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5" /> Engine v2.4
        </span>
      </div>

      {/* Insights List */}
      <div className="space-y-4 flex-1 relative z-10">
        {insights.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-zinc-950 border border-zinc-800"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-zinc-200 text-sm flex items-center gap-2">
                <item.icon className="w-4 h-4 text-zinc-400" />
                {item.title}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${item.color}`}>
                {item.tag}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed pl-6">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Footer Summary */}
      <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 font-medium relative z-10">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Confidence: 98.2%
        </span>
        <span>Updated 2 mins ago</span>
      </div>
    </div>
  );
}
