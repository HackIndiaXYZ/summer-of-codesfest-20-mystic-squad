import { useState } from "react";
import { Settings2, Trash2, Cpu, Activity, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Modal from "./Modal";
import Toast from "./Toast";
import { useDevice } from "@/hooks/useDevice";

export default function DeviceCard({ device }) {
  const { unpairDevice, updateConfig } = useDevice();
  const [showUnpairModal, setShowUnpairModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [config, setConfig] = useState(
    device.config || { scanSpeed: 50, sensitivity: 50 }
  );

  const handleConfigChange = async (key, value) => {
    const newConfig = { ...config, [key]: Number(value) };
    setConfig(newConfig);
    await updateConfig(device.id, newConfig);
  };

  const handleUnpair = async () => {
    const res = await unpairDevice(device.id);
    if (res.error) {
      setToast({ type: "error", message: res.error });
    } else {
      setShowUnpairModal(false);
    }
  };

  const isOnline = device.status === "online";

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 flex flex-col gap-6 shadow-lg group hover:border-blue-500/30 transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2 tracking-tight">
              <Cpu className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              {device.id}
            </h3>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-white/50 font-semibold">
              <span className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline
                      ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                      : "bg-red-400"
                  }`}
                />
                {isOnline ? "Online" : "Offline"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Seen {formatDistanceToNow(device.lastSeen, { addSuffix: true })}
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded border border-white/5">
                v{device.firmwareVersion || "1.4.2"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowUnpairModal(true)}
            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 pt-5 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/70 mb-2">
            <Settings2 className="w-4 h-4 text-blue-400" />
            Device Configuration
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white/50">Scan Speed</span>
              <span className="text-white">{config.scanSpeed}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={config.scanSpeed}
              onChange={(e) => handleConfigChange("scanSpeed", e.target.value)}
              className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white/50">Sensitivity Threshold</span>
              <span className="text-white">{config.sensitivity}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={config.sensitivity}
              onChange={(e) => handleConfigChange("sensitivity", e.target.value)}
              className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={showUnpairModal}
        onClose={() => setShowUnpairModal(false)}
        title="Unpair Device"
        actions={
          <>
            <button
              onClick={() => setShowUnpairModal(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-echogaze-text hover:bg-echogaze-surface transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUnpair}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Unpair
            </button>
          </>
        }
      >
        <p className="text-echogaze-muted text-sm">
          Are you sure you want to unpair device{" "}
          <strong className="text-white">{device.id}</strong>? This action cannot
          be undone, and the device will need to be reconfigured.
        </p>
      </Modal>
    </>
  );
}
