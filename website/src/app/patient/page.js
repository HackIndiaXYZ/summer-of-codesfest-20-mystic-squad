"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Volume2,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Zap,
  CheckCircle2,
  Activity,
  Heart,
  Grid,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Droplets,
  Utensils,
  Pill,
  Bandage,
  Stethoscope,
  Moon,
  BedDouble,
  Bath,
  Thermometer,
  Lightbulb,
  BellRing,
  Users,
  Smile,
  Frown,
  ThumbsUp,
  ThumbsDown,
  VolumeX,
  Music,
  Tv,
  Eye,
  Layers,
  ChevronLeft,
  Brain,
  Wind,
  ShieldCheck,
  PhoneCall,
  RotateCcw,
  Sparkle,
  ArrowDown,
  ArrowUp,
  MousePointerClick,
  Settings
} from "lucide-react";
import { ref, push, set } from "firebase/database";
import { database } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import SettingsModal from "@/components/SettingsModal";

// Rich 4-Column Options List
const SCROLLABLE_COLUMNS = [
  // Column 1: Daily Needs
  {
    title: "Column 1: Essential Needs",
    speakTitle: "Column 1: Essential Needs",
    items: [
      { id: "water", label: "Water 💧", Icon: Droplets, phrase: "I need water to drink", keywords: ["water", "drink", "thirst"] },
      { id: "food", label: "Food 🍲", Icon: Utensils, phrase: "I am hungry and need food", keywords: ["food", "eat", "hungry"] },
      { id: "medicine", label: "Medicine 💊", Icon: Pill, phrase: "I need my scheduled medicine", keywords: ["medicine", "pill", "meds"] },
      { id: "washroom", label: "Washroom 🚾", Icon: Bath, phrase: "I need assistance going to the washroom", keywords: ["washroom", "toilet", "bathroom"] },
      { id: "temp_up", label: "Warming Blanket 🧥", Icon: ShieldCheck, phrase: "Please cover me with a warm blanket", keywords: ["blanket", "warm", "cold"] },
      { id: "temp_down", label: "Cool Air / Fan 🌀", Icon: Wind, phrase: "Please turn on the fan or cool air", keywords: ["fan", "cool", "air"] }
    ]
  },
  // Column 2: Medical Symptoms
  {
    title: "Column 2: Medical & Symptoms",
    speakTitle: "Column 2: Medical and Symptoms",
    items: [
      { id: "pain", label: "Pain Assistance 🩹", Icon: Bandage, phrase: "I am experiencing pain", keywords: ["pain", "hurt", "ache"] },
      { id: "nurse", label: "Call Nurse 🩺", Icon: Stethoscope, phrase: "Please send the nurse immediately", keywords: ["nurse", "doctor", "assistance"] },
      { id: "rest", label: "Rest / Sleep 😴", Icon: Moon, phrase: "I want to rest and sleep", keywords: ["sleep", "rest", "tired"] },
      { id: "headache", label: "Headache 🧠", Icon: Brain, phrase: "I have a severe headache", keywords: ["headache", "head pain", "migraine"] },
      { id: "breathing", label: "Shortness of Breath 🫁", Icon: Wind, phrase: "I am having difficulty breathing", keywords: ["breath", "breathing", "choke"] },
      { id: "doctor", label: "Doctor Checkup 🩺", Icon: Stethoscope, phrase: "I need the doctor to check my vitals", keywords: ["doctor", "checkup", "vitals"] }
    ]
  },
  // Column 3: Room Controls
  {
    title: "Column 3: Room & Bed Controls",
    speakTitle: "Column 3: Room and Bed Controls",
    items: [
      { id: "bed_up", label: "Bed Head Up 🛌", Icon: BedDouble, phrase: "Please raise the head of my bed", keywords: ["raise bed", "bed up", "sit up"] },
      { id: "bed_down", label: "Bed Flat 🛌", Icon: BedDouble, phrase: "Please lower my bed to flat position", keywords: ["lower bed", "bed down", "lay down"] },
      { id: "light_toggle", label: "Toggle Lights 💡", Icon: Lightbulb, phrase: "Please turn the room lights on or off", keywords: ["light", "lights", "lamp"] },
      { id: "tv_toggle", label: "Television 📺", Icon: Tv, phrase: "Please turn on the television", keywords: ["tv", "television", "channel"] },
      { id: "window", label: "Open Window 🪟", Icon: Eye, phrase: "Please open or close the window", keywords: ["window", "blinds", "curtain"] },
      { id: "music", label: "Play Music 🎵", Icon: Music, phrase: "Please play relaxing background music", keywords: ["music", "song", "audio"] }
    ]
  },
  // Column 4: Quick Actions & Emergency
  {
    title: "Column 4: Social & SOS",
    speakTitle: "Column 4: Social and Emergency SOS",
    items: [
      { id: "yes", label: "Yes / Agree 👍", Icon: ThumbsUp, phrase: "Yes, I agree", keywords: ["yes", "agree", "correct"] },
      { id: "no", label: "No / Disagree 👎", Icon: ThumbsDown, phrase: "No, thank you", keywords: ["no", "disagree", "dont"] },
      { id: "thanks", label: "Thank You 🙏", Icon: Heart, phrase: "Thank you so much", keywords: ["thanks", "thank you", "grateful"] },
      { id: "family", label: "Call Family 👨‍👩‍👧‍👦", Icon: Users, phrase: "I would like to call my family", keywords: ["family", "call family", "parents"] },
      { id: "phone", label: "Phone Call 📞", Icon: PhoneCall, phrase: "I need to make a phone call", keywords: ["phone", "call", "cell"] },
      { id: "emergency", label: "EMERGENCY SOS 🚨", Icon: BellRing, phrase: "EMERGENCY: Immediate help needed!", keywords: ["emergency", "sos", "help"] }
    ]
  }
];

export default function PatientPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Navigation State Machine: "COLUMN_SCAN" | "ITEM_ZOOM"
  const [uiState, setUiState] = useState("COLUMN_SCAN");
  const [colIndex, setColIndex] = useState(0); // 0..3
  const [itemIndex, setItemIndex] = useState(0); // 0..N

  // 1-Button Auto-Scan Progress & Configurable Speed
  const [scanProgress, setScanProgress] = useState(0);
  const [scanIntervalMs, setScanIntervalMs] = useState(2500);

  // Settings & Pairing
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deviceCode, setDeviceCode] = useState("ECHO-A4F2");
  const [voiceReadoutEnabled, setVoiceReadoutEnabled] = useState(true);

  // Voice Recognition State
  const [isListening, setIsListening] = useState(false);
  const [lastSpeechCmd, setLastSpeechCmd] = useState("");
  const recognitionRef = useRef(null);

  // Emergency State
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const clickTimestampsRef = useRef([]);
  const audioCtxRef = useRef(null);
  const activeItemRef = useRef(null);
  const buttonPressStartRef = useRef(null);

  // Speech Output (TTS)
  const speakText = useCallback((text) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Speak Highlighted Column or Item on Selection / Cycling Change
  useEffect(() => {
    if (isEmergencyActive || !voiceReadoutEnabled || isSettingsOpen) return;

    if (uiState === "COLUMN_SCAN") {
      const colTitle = SCROLLABLE_COLUMNS[colIndex].speakTitle;
      speakText(colTitle);
    } else {
      const itemLabel = SCROLLABLE_COLUMNS[colIndex].items[itemIndex].label.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
      speakText(itemLabel);
    }
  }, [colIndex, itemIndex, uiState, isEmergencyActive, voiceReadoutEnabled, isSettingsOpen, speakText]);

  // Auto-scroll active item into view
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [colIndex, itemIndex, uiState]);

  // Web Audio Click Sound
  const playClickSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(640, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }, []);

  // Web Audio Alarm Siren
  const triggerBuzzer = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.error("Audio buzzer error", e);
    }
  }, []);

  // Firebase Event Dispatch
  const sendCommandToFirebase = useCallback(
    async (itemData, isEmergency = false) => {
      const payload = {
        timestamp: Date.now(),
        phrase: itemData.phrase || "Emergency Triggered",
        label: itemData.label || "Emergency",
        category: itemData.category || "General",
        column: colIndex + 1,
        row: itemIndex + 1,
        patientId: user?.uid || "DEMO-PATIENT-304",
        patientName: user?.displayName || "Alex Rivera (Bed 4)",
        deviceCode: deviceCode,
        status: isEmergency ? "EMERGENCY" : "COMPLETED"
      };

      if (database && user) {
        try {
          const commandsRef = ref(database, `users/${user.uid}/commands`);
          const newCmdRef = push(commandsRef);
          await set(newCmdRef, payload);

          if (isEmergency) {
            const emergencyRef = ref(database, `users/${user.uid}/emergencies`);
            await set(push(emergencyRef), payload);
          }
        } catch (err) {
          console.error("Firebase dispatch error:", err);
        }
      }
    },
    [user, colIndex, itemIndex, deviceCode]
  );

  // Trigger Emergency SOS
  const triggerEmergency = useCallback(() => {
    setIsEmergencyActive(true);
    triggerBuzzer();
    speakText("EMERGENCY ALERT ACTIVATED. CARETAKER HAS BEEN NOTIFIED.");
    sendCommandToFirebase(
      {
        label: "EMERGENCY SOS",
        phrase: "URGENT EMERGENCY ALERT: Patient pressed emergency button 4 times!",
        category: "Emergency"
      },
      true
    );
  }, [triggerBuzzer, speakText, sendCommandToFirebase]);

  // Handle 4-Click Emergency Detector (ESP32 / Switch rapid press)
  const registerClick = useCallback(() => {
    const now = Date.now();
    clickTimestampsRef.current.push(now);
    clickTimestampsRef.current = clickTimestampsRef.current.filter(
      (t) => now - t <= 3000
    );

    if (clickTimestampsRef.current.length >= 4) {
      clickTimestampsRef.current = [];
      triggerEmergency();
    }
  }, [triggerEmergency]);

  // 1-BUTTON MAIN INPUT CONTROL: Pressing the 1 button performs SELECT / ZOOM
  const handleSingleButtonPress = useCallback(() => {
    if (isSettingsOpen) return;
    playClickSound();
    setScanProgress(0);

    if (uiState === "COLUMN_SCAN") {
      setUiState("ITEM_ZOOM");
      setItemIndex(0);
    } else {
      const selectedItem = SCROLLABLE_COLUMNS[colIndex].items[itemIndex];

      if (selectedItem.id === "emergency") {
        triggerEmergency();
      } else {
        speakText(selectedItem.phrase);
        sendCommandToFirebase(selectedItem, false);
      }

      setUiState("COLUMN_SCAN");
    }
  }, [uiState, colIndex, itemIndex, isSettingsOpen, speakText, playClickSound, triggerEmergency, sendCommandToFirebase]);

  // Long-Hold (>1s) of 1-Button = BACK / UNZOOM
  const handleSingleButtonLongHold = useCallback(() => {
    if (isSettingsOpen) return;
    playClickSound();
    if (uiState === "ITEM_ZOOM") {
      setUiState("COLUMN_SCAN");
    }
  }, [uiState, isSettingsOpen, playClickSound]);

  // TOUCH BYPASS CONTROL: Directly selecting an item on screen
  const handleTouchBypassItem = useCallback(
    (cIdx, rIdx) => {
      playClickSound();
      setColIndex(cIdx);
      setItemIndex(rIdx);
      const selectedItem = SCROLLABLE_COLUMNS[cIdx].items[rIdx];

      if (selectedItem.id === "emergency") {
        triggerEmergency();
      } else {
        speakText(selectedItem.phrase);
        sendCommandToFirebase(selectedItem, false);
      }

      setUiState("COLUMN_SCAN");
    },
    [speakText, playClickSound, triggerEmergency, sendCommandToFirebase]
  );

  // TOUCH BYPASS CONTROL: Directly zooming into a column
  const handleTouchBypassColumn = useCallback(
    (cIdx) => {
      playClickSound();
      setColIndex(cIdx);
      setUiState("ITEM_ZOOM");
      setItemIndex(0);
    },
    [playClickSound]
  );

  // Automatic Scanning Cycling Engine
  useEffect(() => {
    if (isEmergencyActive || isSettingsOpen) return;

    let startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / scanIntervalMs) * 100);
      setScanProgress(progress);

      if (elapsed >= scanIntervalMs) {
        startTime = Date.now();
        setScanProgress(0);

        if (uiState === "COLUMN_SCAN") {
          setColIndex((prev) => (prev + 1) % 4);
        } else {
          const maxItems = SCROLLABLE_COLUMNS[colIndex].items.length;
          setItemIndex((prev) => (prev + 1) % maxItems);
        }
      }
    }, 50);

    return () => clearInterval(timer);
  }, [uiState, colIndex, isEmergencyActive, isSettingsOpen, scanIntervalMs]);

  // Voice Command Processing
  const processVoiceTranscript = useCallback((rawTranscript) => {
    const text = rawTranscript.trim().toLowerCase();
    setLastSpeechCmd(text);

    if (text.includes("emergency") || text.includes("help") || text.includes("sos")) {
      triggerEmergency();
      return;
    }

    if (text.includes("select") || text.includes("choose") || text.includes("press") || text.includes("confirm") || text.includes("click")) {
      handleSingleButtonPress();
      return;
    }

    if (text.includes("back") || text.includes("unzoom") || text.includes("return")) {
      handleSingleButtonLongHold();
      return;
    }

    // Direct Phrase Matching
    for (let c = 0; c < SCROLLABLE_COLUMNS.length; c++) {
      const col = SCROLLABLE_COLUMNS[c];
      for (let r = 0; r < col.items.length; r++) {
        const item = col.items[r];
        if (item.keywords && item.keywords.some((kw) => text.includes(kw))) {
          handleTouchBypassItem(c, r);
          return;
        }
      }
    }
  }, [triggerEmergency, handleSingleButtonPress, handleSingleButtonLongHold, handleTouchBypassItem]);

  // Toggle Voice Recognition ON DEMAND
  const toggleListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
          const lastIndex = event.results.length - 1;
          const transcript = event.results[lastIndex][0].transcript;
          processVoiceTranscript(transcript);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  // 1-Button Keyboard Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSettingsOpen) return;
      registerClick();

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!buttonPressStartRef.current) {
          buttonPressStartRef.current = Date.now();
        }
      } else if (e.key === "Escape" || e.key === "Backspace") {
        e.preventDefault();
        handleSingleButtonLongHold();
      } else if (e.key >= "1" && e.key <= "4") {
        handleTouchBypassColumn(parseInt(e.key) - 1);
      } else if (e.key === "e" || e.key === "E") {
        triggerEmergency();
      }
    };

    const handleKeyUp = (e) => {
      if (isSettingsOpen) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (buttonPressStartRef.current) {
          const pressDuration = Date.now() - buttonPressStartRef.current;
          buttonPressStartRef.current = null;

          if (pressDuration >= 800) {
            handleSingleButtonLongHold();
          } else {
            handleSingleButtonPress();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleSingleButtonPress, handleSingleButtonLongHold, handleTouchBypassColumn, isSettingsOpen, registerClick, triggerEmergency]);

  return (
    <div
      onClick={registerClick}
      className={`min-h-screen flex flex-col bg-echogaze-bg text-echogaze-text relative overflow-hidden select-none transition-colors duration-300 ${
        isEmergencyActive ? "ring-8 ring-red-500 animate-pulse" : ""
      }`}
    >
      {/* Emergency Overlay Banner */}
      {isEmergencyActive && (
        <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between z-50 animate-bounce shadow-2xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 animate-spin" />
            <div>
              <h2 className="text-xl font-extrabold tracking-wide">
                EMERGENCY ALERT ACTIVE
              </h2>
              <p className="text-sm opacity-90">
                Caregiver & Admin Panel have been alerted with urgent priority!
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEmergencyActive(false);
            }}
            className="bg-white text-red-700 px-5 py-2 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-md"
          >
            Dismiss Alert
          </button>
        </div>
      )}

      {/* Header Bar */}
      <header className="px-6 py-4 border-b border-echogaze-surface-hover glass flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-xl bg-echogaze-surface hover:bg-echogaze-surface-hover text-echogaze-muted hover:text-white transition-colors"
            title="Back to Admin Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-white tracking-tight">
                EchoGaze
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                <MousePointerClick className="w-3.5 h-3.5" /> Code: {deviceCode}
              </span>
            </div>
            <p className="text-xs text-echogaze-muted">
              Auto Scanning: {(scanIntervalMs / 1000).toFixed(1)}s speed | Voice Readout: {voiceReadoutEnabled ? "ON" : "OFF"}
            </p>
          </div>
        </div>

        {/* Controls, Settings & Theme */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleListening}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isListening
                ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                : "bg-echogaze-surface/80 hover:bg-echogaze-surface-hover text-echogaze-muted"
            }`}
          >
            {isListening ? <Mic className="w-4 h-4 text-red-400 animate-bounce" /> : <MicOff className="w-4 h-4" />}
            <span>{isListening ? "Voice ON" : "Enable Voice"}</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-xl bg-echogaze-surface hover:bg-echogaze-surface-hover text-echogaze-muted hover:text-white border border-echogaze-surface-hover transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Open Settings"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <ThemeToggle />

          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerEmergency();
            }}
            className="bg-red-600/90 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
            title="Press 4 times quickly or tap here for emergency"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SOS (4x)</span>
          </button>
        </div>
      </header>

      {/* Voice Recognition Command Feed */}
      {lastSpeechCmd && (
        <div className="bg-echogaze-surface/60 border-b border-echogaze-surface-hover px-6 py-1.5 text-center text-xs text-blue-400 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Voice Recognized: <strong>"{lastSpeechCmd}"</strong></span>
        </div>
      )}

      {/* Main 4 Scrollable Columns Container */}
      <main className="flex-1 p-6 flex flex-col justify-center max-w-7xl mx-auto w-full z-10 overflow-hidden">
        
        {/* Navigation Status & Scanning Progress Bar */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-echogaze-surface border border-echogaze-surface-hover text-sm font-semibold text-white flex items-center gap-2 shadow-sm">
                <Grid className="w-4 h-4 text-blue-400" />
                <span>
                  State:{" "}
                  <span className="text-blue-400 font-bold">
                    {uiState === "COLUMN_SCAN" ? "COLUMN SCANNING (1-Tap to Zoom Column)" : `ZOOMED COLUMN ${colIndex + 1} (1-Tap to Select Item)`}
                  </span>
                </span>
              </div>

              {uiState === "ITEM_ZOOM" && (
                <button
                  onClick={handleSingleButtonLongHold}
                  className="px-3 py-1.5 rounded-xl bg-echogaze-surface-hover hover:bg-blue-500/20 text-xs font-semibold text-echogaze-text flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Hold / Unzoom Column
                </button>
              )}
            </div>

            <div className="text-xs text-echogaze-muted flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Voice Readout: {voiceReadoutEnabled ? "Active" : "Muted"}</span>
            </div>
          </div>

          {/* Auto-Scan Cycling Timer Progress Bar */}
          <div className="w-full bg-echogaze-surface-hover h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.6)]"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>

        {/* 4 Scrollable Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 items-stretch overflow-hidden">
          {SCROLLABLE_COLUMNS.map((columnData, cIdx) => {
            const isColumnSelected = colIndex === cIdx;

            return (
              <div
                key={cIdx}
                onClick={(e) => {
                  e.stopPropagation();
                  if (uiState === "COLUMN_SCAN") {
                    handleTouchBypassColumn(cIdx);
                  }
                }}
                className={`flex flex-col gap-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer border relative overflow-hidden ${
                  isColumnSelected
                    ? uiState === "COLUMN_SCAN"
                      ? "bg-echogaze-surface/80 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.35)] ring-2 ring-blue-500 scale-[1.02]"
                      : "bg-echogaze-surface/90 border-blue-500/60 shadow-xl"
                    : "bg-echogaze-surface/30 border-echogaze-surface-hover opacity-65 hover:opacity-90"
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-echogaze-surface-hover shrink-0">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-echogaze-muted flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isColumnSelected ? "bg-blue-500 animate-ping" : "bg-echogaze-muted"
                      }`}
                    />
                    {columnData.title}
                  </span>
                  {isColumnSelected && uiState === "COLUMN_SCAN" && (
                    <span className="text-xs font-bold text-blue-400 animate-pulse">
                      Cycling Here
                    </span>
                  )}
                </div>

                {/* Scrollable Items List inside Column */}
                <div className="flex-1 overflow-y-auto max-h-[60vh] space-y-3.5 pr-1 scrollbar-thin scroll-smooth">
                  {columnData.items.map((item, rIdx) => {
                    const isItemHighlighted =
                      isColumnSelected && uiState === "ITEM_ZOOM" && itemIndex === rIdx;
                    const ItemIcon = item.Icon;

                    return (
                      <div
                        key={item.id}
                        ref={isItemHighlighted ? activeItemRef : null}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTouchBypassItem(cIdx, rIdx);
                        }}
                        className={`p-4 rounded-xl flex items-center gap-3.5 transition-all duration-200 border cursor-pointer ${
                          isItemHighlighted
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-white ring-4 ring-blue-500 shadow-2xl scale-[1.03]"
                            : item.id === "emergency"
                            ? "bg-red-950/40 border-red-500/40 text-red-200 hover:bg-red-900/50"
                            : "bg-echogaze-surface/40 border-echogaze-surface-hover text-echogaze-text hover:bg-echogaze-surface/80"
                        }`}
                      >
                        <div className="p-3 rounded-xl bg-echogaze-surface/80 border border-echogaze-surface-hover shrink-0 text-blue-400 shadow-md">
                          <ItemIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm md:text-base leading-tight truncate">
                            {item.label}
                          </h3>
                          <p className="text-xs text-echogaze-muted truncate mt-0.5">
                            {item.phrase}
                          </p>
                        </div>

                        {isItemHighlighted && (
                          <ChevronRight className="w-5 h-5 text-blue-400 animate-bounce shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer Controls & 1-Button Input Simulation */}
      <footer className="p-4 glass border-t border-echogaze-surface-hover flex flex-wrap items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-6 text-xs text-echogaze-muted">
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 rounded bg-echogaze-surface border border-echogaze-surface-hover text-white font-mono">
              Space / 1-Button Tap
            </kbd>{" "}
            Select / Zoom
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 rounded bg-echogaze-surface border border-echogaze-surface-hover text-white font-mono">
              Hold (&gt;1s) / Esc
            </kbd>{" "}
            Unzoom / Back
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 rounded bg-echogaze-surface border border-echogaze-surface-hover text-white font-mono">
              4x Taps
            </kbd>{" "}
            Emergency SOS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSingleButtonPress}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black px-8 py-2.5 rounded-xl shadow-xl hover:shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2"
            title="Press this single button to select the currently highlighted option"
          >
            <span>ESP32 1-BUTTON PRESS ✓</span>
          </button>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        scanSpeed={scanIntervalMs}
        setScanSpeed={setScanIntervalMs}
        voiceEnabled={voiceReadoutEnabled}
        setVoiceEnabled={setVoiceReadoutEnabled}
        deviceCode={deviceCode}
        onDeviceCodeChange={setDeviceCode}
      />
    </div>
  );
}
