import { useState, useEffect } from "react";
import { MessageSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CommandFeed({ commands = [], loading = false }) {
  const [pulseId, setPulseId] = useState(null);

  useEffect(() => {
    if (commands.length > 0) {
      const latest = commands[0].id;
      setPulseId(latest);
      const timer = setTimeout(() => setPulseId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [commands]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (commands.length === 0) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-2xl text-center flex flex-col items-center gap-4">
        <MessageSquare className="w-10 h-10 text-zinc-700" />
        <p className="text-zinc-500 text-sm font-medium">No commands received yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin">
      {commands.map((cmd, index) => (
        <div
          key={cmd.id}
          className={`p-4 rounded-xl flex items-start gap-4 transition-all duration-300 hover:bg-zinc-800 border ${
            pulseId === cmd.id 
              ? "bg-zinc-800 border-zinc-600" 
              : "bg-zinc-950 border-zinc-800"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-2xl shrink-0 border border-zinc-800">
            {cmd.emoji || "💬"}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex justify-between items-start mb-1.5">
              <h4 className="font-medium text-zinc-100 text-sm truncate pr-2">
                {cmd.phrase}
              </h4>
              <span className="text-xs text-zinc-500 whitespace-nowrap flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(cmd.timestamp, { addSuffix: true })}
              </span>
            </div>
            <span className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-medium ${
              cmd.category === "Emergency" || cmd.status === "EMERGENCY"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            }`}>
              {cmd.category || "General"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
