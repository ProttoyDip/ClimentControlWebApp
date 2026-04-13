import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

interface ToastProps {
  message: string;
  tone?: "success" | "error" | "info";
  onClose: () => void;
}

export function Toast({ message, tone = "info", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);

  const toneClass = {
    success: "border-emerald-400/35 bg-emerald-400/15 text-emerald-100",
    error: "border-red-400/35 bg-red-400/15 text-red-100",
    info: "border-cyan-400/35 bg-cyan-400/15 text-cyan-100"
  } as const;

  return (
    <div className={cn("fixed bottom-4 right-4 z-[70] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur", toneClass[tone])}>
      <div className="flex items-start gap-3">
        <p className="flex-1">{message}</p>
        <button type="button" onClick={onClose} className="rounded p-0.5 hover:bg-white/10" aria-label="Close notification">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
