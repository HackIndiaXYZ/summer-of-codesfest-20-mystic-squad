import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, actions }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-up">
      <div className="glass rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-echogaze-text">{title}</h2>
          <button
            onClick={onClose}
            className="text-echogaze-muted hover:text-echogaze-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-8">{children}</div>
        <div className="flex justify-end gap-3">{actions}</div>
      </div>
    </div>
  );
}
