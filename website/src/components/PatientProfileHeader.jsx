"use client";
import { useState } from "react";
import { User, Activity, Wifi, Battery, MapPin, ExternalLink, ShieldCheck, Heart, Stethoscope, Sparkles, Settings } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import SettingsModal from "@/components/SettingsModal";

export default function PatientProfileHeader({ user, emergencyCount = 0 }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scanSpeed, setScanSpeed] = useState(2500);
  const [deviceCode, setDeviceCode] = useState("ECHO-A4F2");

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8 relative group">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Patient Profile Details */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
              <div className="text-zinc-300 font-medium text-2xl">
                {(user?.displayName || "A").charAt(0).toUpperCase()}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
                  {user?.displayName || "Alex Rivera"}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
                </span>
              </div>

              <p className="text-sm text-zinc-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-zinc-500" /> Room 304 (Bed B)
                </span>
                <span className="opacity-30">•</span>
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-zinc-500" /> Diagnosis: ALS Phase II
                </span>
                <span className="opacity-30">•</span>
                <span>Code: <strong className="text-zinc-200 font-mono">{deviceCode}</strong></span>
              </p>
            </div>
          </div>

          {/* Telemetry & Quick Action Switch */}
          <div className="flex flex-wrap items-center gap-4 border-t lg:border-t-0 pt-6 lg:pt-0 border-zinc-800 relative z-10">
            {/* Telemetry Pill 1: ESP32 Battery */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
              <Battery className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-zinc-500 block text-[10px] font-medium">ESP32 Power</span>
                <span className="font-medium text-zinc-200">94% (Charging)</span>
              </div>
            </div>

            {/* Telemetry Pill 2: WiFi Signal */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
              <Wifi className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-zinc-500 block text-[10px] font-medium">Signal RSSI</span>
                <span className="font-medium text-zinc-200">-62 dBm</span>
              </div>
            </div>

            {/* Settings Modal Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors flex items-center gap-2 text-xs font-medium"
              title="Open Device & Scanning Settings"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Quick Patient UI Switch Button */}
            <Link
              href="/patient"
              className="px-5 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-medium text-sm transition-colors flex items-center gap-2"
            >
              <span>Open Patient Grid UI</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        scanSpeed={scanSpeed}
        setScanSpeed={setScanSpeed}
        deviceCode={deviceCode}
        onDeviceCodeChange={setDeviceCode}
      />
    </>
  );
}
