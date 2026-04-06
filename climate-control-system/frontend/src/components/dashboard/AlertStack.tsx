import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Info, TriangleAlert, X } from "lucide-react";
import { useEffect } from "react";
import { useDashboardStore } from "../../store/dashboardStore";

const iconMap = {
  info: Info,
  warning: TriangleAlert,
  critical: AlertCircle
} as const;

const toneMap = {
  info: "border-blue-300/40 bg-blue-300/12",
  warning: "border-amber-300/40 bg-amber-300/12",
  critical: "border-red-300/40 bg-red-300/12"
} as const;

export function AlertStack() {
  const alerts = useDashboardStore((state) => state.alerts);
  const dismissAlert = useDashboardStore((state) => state.dismissAlert);

  useEffect(() => {
    const timers = alerts.map((alert) => setTimeout(() => dismissAlert(alert.id), 5200));
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [alerts, dismissAlert]);

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-50 space-y-2 md:right-4 md:top-4">
      <AnimatePresence>
        {alerts.map((alert) => {
          const Icon = iconMap[alert.type];
          return (
            <motion.div
              key={alert.id}
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 80, opacity: 0 }}
              className={`pointer-events-auto flex w-[min(340px,90vw)] items-start gap-3 rounded-xl border p-3 backdrop-blur ${toneMap[alert.type]}`}
            >
              <Icon size={18} className="mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{alert.title}</p>
                <p className="text-xs text-subtle">{alert.message}</p>
              </div>
              <button className="rounded-md p-1 hover:bg-white/10" onClick={() => dismissAlert(alert.id)}>
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
