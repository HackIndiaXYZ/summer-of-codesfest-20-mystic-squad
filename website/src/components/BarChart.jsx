import React from "react";

export default function BarChart({ data }) {
  // data = [{ label: '10am', value: 12 }, ...]
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex flex-col gap-4 mt-4 w-full">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-4 group">
          <div className="w-12 text-[10px] uppercase tracking-widest text-white/50 font-bold text-right group-hover:text-white/80 transition-colors">
            {item.label}
          </div>
          <div className="flex-1 h-3.5 bg-black/40 border border-white/5 shadow-inner rounded-full overflow-hidden relative">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.6)]"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <div className="w-8 text-sm font-bold text-white tracking-tight">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
