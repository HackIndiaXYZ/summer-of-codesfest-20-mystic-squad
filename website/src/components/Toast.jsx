import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Toast({ type = "info", message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
  };

  const bgColors = {
    success: "bg-green-500/10 border-green-500/20",
    error: "bg-red-500/10 border-red-500/20",
    info: "bg-cyan-500/10 border-cyan-500/20",
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl animate-slide-in shadow-lg",
        bgColors[type]
      )}
    >
      {icons[type]}
      <p className="text-sm font-medium text-echogaze-text">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-echogaze-muted hover:text-echogaze-text transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
