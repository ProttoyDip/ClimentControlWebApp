import { motion } from "framer-motion";
import { ActivitySquare, PanelRightOpen, Settings, ThermometerSun, Waves, Zap } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: ThermometerSun, to: "/dashboard" },
  { id: "analytics", label: "Analytics", icon: ActivitySquare, to: "/analytics" },
  { id: "settings", label: "Settings", icon: Settings, to: "/settings" },
  { id: "energy", label: "Energy", icon: Zap, to: "/analytics#energy" }
];

export function Sidebar({ collapsed, onToggle, mobile = false }: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed && !mobile ? 88 : mobile ? 248 : 260 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      className={cn(
        "glass-card shrink-0 overflow-y-auto p-4",
        mobile ? "flex h-full flex-col" : "hidden lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:flex lg:h-screen lg:flex-col"
      )}
    >
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className={cn("overflow-hidden", collapsed && !mobile && "hidden")}>
          <p className="text-xs uppercase tracking-[0.24em] text-subtle">Smart Room</p>
          <h1 className="text-lg font-semibold">Climate Control</h1>
          <p className="mt-1 text-xs text-subtle">Premium operations console</p>
        </div>
        <Button variant="ghost" className="!p-2" onClick={onToggle}>
          <PanelRightOpen size={16} />
        </Button>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm transition-all",
                isActive
                  ? "border-cyan-300/40 bg-cyan-300/12 text-[color:var(--text)] shadow-[0_16px_30px_rgba(6,182,212,0.12)]"
                  : "border-transparent text-subtle hover:border-cyan-300/25 hover:bg-white/5 hover:text-[color:var(--text)]"
              )
            }
          >
            <item.icon size={17} className="text-cyan-300" />
            {!collapsed || mobile ? <span>{item.label}</span> : null}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-cyan-200/20 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent p-3 text-xs text-subtle">
        <p className="mb-1 font-medium text-[color:var(--text)]">Live telemetry</p>
        <p>Realtime stream active across climate sensors and device controls.</p>
      </div>
    </motion.aside>
  );
}
