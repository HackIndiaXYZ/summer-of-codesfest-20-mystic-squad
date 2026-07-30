"use client";
import { useState, useEffect, useRef } from "react";
import { AlertTriangle, BellRing, Check, ShieldAlert, User, Heart, MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function EmergencyAlertBanner({ emergencyData, onAcknowledge }) {
  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (!emergencyData) return;

    // Play Web Audio siren sound for Caretaker Alert
    let interval;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const playBeep = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(960, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      };

      playBeep();
      interval = setInterval(playBeep, 800);
    } catch (e) {
      console.error("Audio synth error:", e);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [emergencyData]);

  if (!emergencyData) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 p-4 animate-slide-in">
      <div className="max-w-6xl mx-auto bg-gradient-to-r from-red-950/90 via-red-900/90 to-red-950/90 border-2 border-red-500 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.5)] flex flex-col md:flex-row items-center justify-between gap-6 text-white animate-pulse">
        
        {/* Left Status & Details */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-600 rounded-2xl shadow-lg shrink-0 animate-bounce">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-500 text-white shadow">
                CRITICAL SOS ALERT
              </span>
              <span className="text-xs text-red-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {emergencyData.timestamp
                  ? formatDistanceToNow(emergencyData.timestamp, { addSuffix: true })
                  : "Just now"}
              </span>
            </div>

            <h2 className="text-2xl font-black mt-1 tracking-tight text-red-100">
              {emergencyData.patientName || "Alex Rivera"} - Room 304 (Bed B)
            </h2>
            <p className="text-sm text-red-200 mt-0.5">
              {emergencyData.phrase || "Patient triggered Emergency SOS button 4 times!"}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-red-100">
              <span className="flex items-center gap-1 font-semibold bg-red-900/60 px-2.5 py-1 rounded-lg border border-red-500/30">
                <MapPin className="w-3.5 h-3.5 text-red-400" /> Room 304, Bed B
              </span>
              <span className="flex items-center gap-1 font-semibold bg-red-900/60 px-2.5 py-1 rounded-lg border border-red-500/30">
                <Heart className="w-3.5 h-3.5 text-red-400 animate-ping" /> Heart Rate: 104 BPM (Elevated)
              </span>
              <span className="flex items-center gap-1 font-semibold bg-red-900/60 px-2.5 py-1 rounded-lg border border-red-500/30">
                <User className="w-3.5 h-3.5 text-red-400" /> Dr. Sarah Vance (Attending)
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onAcknowledge}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-white text-red-800 hover:bg-gray-100 font-extrabold text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5 text-red-700" />
            <span>ACKNOWLEDGE EMERGENCY</span>
          </button>
        </div>

      </div>
    </div>
  );
}
