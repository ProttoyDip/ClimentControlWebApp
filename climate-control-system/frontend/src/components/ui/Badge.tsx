import { cn } from "../../utils/cn";

interface BadgeProps {
  label: string;
  tone?: "online" | "offline" | "warning" | "neutral";
}

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const tones = {
    online: "bg-emerald-400/12 text-emerald-300 border-emerald-400/25",
    offline: "bg-red-400/12 text-red-300 border-red-400/25",
    warning: "bg-amber-400/12 text-amber-300 border-amber-400/25",
    neutral: "bg-slate-400/12 text-slate-300 border-slate-400/25"
  } as const;

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide", tones[tone])}>
      {label}
    </span>
  );
}
