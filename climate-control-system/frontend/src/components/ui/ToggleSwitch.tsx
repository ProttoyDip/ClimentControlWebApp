import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 rounded-full border transition-colors",
        checked ? "border-emerald-400/50 bg-emerald-400/25" : "border-slate-400/30 bg-slate-400/20",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
      )}
      aria-pressed={checked}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "absolute top-0.5 h-[22px] w-[22px] rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)]",
          checked ? "left-[26px]" : "left-0.5"
        )}
      />
    </button>
  );
}
