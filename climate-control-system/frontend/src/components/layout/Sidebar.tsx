import { motion } from "framer-motion";
import { PanelRightOpen, ThermometerSun, Waves, Zap, Settings } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

const navItems = [
  { id: "overview", label: "Overview", icon: ThermometerSun },
  { id: "humidity", label: "Humidity", icon: Waves },
  { id: "energy", label: "Energy", icon: Zap },
  { id: "settings", label: "Settings", icon: Settings }
];

export function Sidebar({ collapsed, onToggle, mobile = false }: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed && !mobile ? 88 : mobile ? 248 : 260 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      className={cn(
        "glass-card h-[calc(100vh-2rem)] shrink-0 p-4",
        mobile ? "flex flex-col" : "hidden lg:flex lg:flex-col"
      )}
    >
      <div className="mb-8 flex items-center justify-between">
        <div className={cn("overflow-hidden", collapsed && !mobile && "hidden")}>
          <p className="text-xs uppercase tracking-[0.2em] text-subtle">Climate SaaS</p>
          <h1 className="text-lg font-semibold">Control Cloud</h1>
        </div>
        <Button variant="ghost" className="!p-2" onClick={onToggle}>
          <PanelRightOpen size={16} />
        </Button>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left text-sm text-slate-200 transition-all hover:border-cyan-300/30 hover:bg-cyan-300/10"
          >
            <item.icon size={17} className="text-cyan-300" />
            {!collapsed || mobile ? <span>{item.label}</span> : null}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-cyan-200/20 bg-cyan-500/10 p-3 text-xs text-subtle">
        Real-time status stream active
      </div>
    </motion.aside>
  );
}
