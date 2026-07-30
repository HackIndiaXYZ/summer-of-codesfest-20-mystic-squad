"use client";
import { useState, useEffect } from "react";
import {
  Settings,
  X,
  Zap,
  Moon,
  Sun,
  Key,
  Volume2,
  Sliders,
  CheckCircle2,
  Copy,
  RefreshCw,
  Cpu,
  Wifi,
  Shield
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function SettingsModal({
  isOpen,
  onClose,
  scanSpeed,
  setScanSpeed,
  voiceEnabled,
  setVoiceEnabled,
  deviceCode = "ECHO-A4F2",
  onDeviceCodeChange
}) {
  const [copied, setCopied] = useState(false);
  const [tempCode, setTempCode] = useState(deviceCode);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setTempCode(deviceCode);
  }, [deviceCode]);

  if (!isOpen) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(tempCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onDeviceCodeChange) {
      onDeviceCodeChange(tempCode);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-up">
      <div className="bg-echogaze-surface border border-echogaze-surface-hover rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-echogaze-text relative">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-echogaze-surface-hover pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                System & Device Settings
              </h2>
              <p className="text-xs text-echogaze-muted">
                Configure scanning speed, theme, and ESP32 device pairing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-echogaze-muted hover:text-white hover:bg-echogaze-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Settings List */}
        <div className="space-y-5 text-sm">
          
          {/* 1. Auto-Scan Speed Setting */}
          <div className="p-4 rounded-xl bg-echogaze-surface-hover/50 border border-echogaze-surface-hover space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" /> Auto-Scan Cycling Speed
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">
                {(scanSpeed / 1000).toFixed(1)}s per item
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="5000"
              step="250"
              value={scanSpeed}
              onChange={(e) => setScanSpeed(Number(e.target.value))}
              className="w-full h-2 bg-echogaze-surface rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-echogaze-muted font-mono">
              <span>Fast (1.0s)</span>
              <span>Medium (2.5s)</span>
              <span>Slow (5.0s)</span>
            </div>
          </div>

          {/* 2. Theme Toggle */}
          <div className="p-4 rounded-xl bg-echogaze-surface-hover/50 border border-echogaze-surface-hover flex items-center justify-between">
            <div>
              <span className="font-semibold text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" /> Color Theme
              </span>
              <p className="text-xs text-echogaze-muted mt-0.5">
                Switch between Light & Dark modes
              </p>
            </div>
            <ThemeToggle />
          </div>

          {/* 3. Account Connect Code / Device Pairing */}
          <div className="p-4 rounded-xl bg-echogaze-surface-hover/50 border border-echogaze-surface-hover space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" /> ESP32 Device Connect Code
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Linked
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={tempCode}
                  onChange={(e) => setTempCode(e.target.value.toUpperCase())}
                  className="w-full bg-echogaze-surface border border-echogaze-surface-hover rounded-xl px-3.5 py-2 text-white font-mono text-sm font-bold focus:outline-none focus:border-blue-500"
                  placeholder="e.g. ECHO-A4F2"
                />
              </div>
              <button
                onClick={copyCode}
                className="p-2.5 rounded-xl bg-echogaze-surface hover:bg-echogaze-surface-hover text-echogaze-muted hover:text-white border border-echogaze-surface-hover transition-colors"
                title="Copy Code"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-echogaze-muted">
              Enter the unique ESP32 pairing code printed on the device hardware label.
            </p>
          </div>

          {/* 4. Audio Readout Toggle */}
          {setVoiceEnabled && (
            <div className="p-4 rounded-xl bg-echogaze-surface-hover/50 border border-echogaze-surface-hover flex items-center justify-between">
              <div>
                <span className="font-semibold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-blue-400" /> Voice Readout Feedback
                </span>
                <p className="text-xs text-echogaze-muted mt-0.5">
                  Speak out highlighted items during auto-scan
                </p>
              </div>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  voiceEnabled ? "bg-blue-600" : "bg-echogaze-surface"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    voiceEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-echogaze-surface-hover">
          <span className="text-xs text-echogaze-muted font-mono flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" /> Firmware v2.5.0-PRO
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-echogaze-surface hover:bg-echogaze-surface-hover text-echogaze-muted hover:text-white font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Saved!
                </>
              ) : (
                "Save Preferences"
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
