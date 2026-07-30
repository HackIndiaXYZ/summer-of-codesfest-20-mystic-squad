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
    <div className="flex flex-col gap-4 overflow-y-auto max-h-[650px] pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
      {commands.map((cmd, index) => {
        const isEmergency = cmd.category === "Emergency" || cmd.status === "EMERGENCY";
        const isGrid = cmd.category === "Grid";
        const pulseClass = pulseId === cmd.id ? "ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "";
        
        // Extract what they want from the phrase if it's a grid item (e.g. "Water", "Food")
        const phrase = cmd.phrase || "";
        const wantedItem = phrase.replace(/^Patient wants /i, "").replace(/^I need /i, "").replace(/^Please provide /i, "");

        return (
          <div
            key={cmd.id}
            className={`p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-5 transition-all duration-300 border ${
              isEmergency 
                ? "bg-red-500/5 border-red-500/30 hover:bg-red-500/10" 
                : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
            } ${pulseClass}`}
          >
            {/* Avatar / Icon */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border shadow-inner ${
              isEmergency ? "bg-red-500/20 border-red-500/40 text-red-500" : "bg-zinc-950 border-zinc-800"
            }`}>
              {cmd.emoji || "💬"}
            </div>
            
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide border ${
                    isEmergency
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}>
                    {cmd.category || "General"}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDistanceToNow(cmd.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              <div className="mt-1">
                {isGrid ? (
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    <strong className="text-white">Request:</strong> This person wants <span className="font-semibold text-blue-400">{wantedItem.toLowerCase()}</span>. 
                    Please provide them with the requested item, and check their room (Room 302, Bed A) and patient information.
                  </p>
                ) : (
                  <p className={`text-sm leading-relaxed ${isEmergency ? "text-red-200 font-medium" : "text-zinc-300"}`}>
                    {cmd.phrase}
                  </p>
                )}
              </div>
            </div>
            
            {/* Mock Patient Info Block */}
            <div className="w-full md:w-auto mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-zinc-800 md:pl-5 flex flex-col gap-1 shrink-0 text-sm">
              <div className="flex items-center justify-between md:justify-start gap-3">
                <span className="text-zinc-500 text-xs uppercase tracking-wider">Patient ID</span>
                <span className="text-zinc-300 font-mono text-xs bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">{cmd.device_id ? cmd.device_id.slice(0, 8) : "ECHO-001"}</span>
              </div>
              <div className="flex items-center justify-between md:justify-start gap-3">
                <span className="text-zinc-500 text-xs uppercase tracking-wider">Location</span>
                <span className="text-zinc-300 font-medium text-xs">Ward 3, Rm 302</span>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
