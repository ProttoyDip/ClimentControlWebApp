import { Home, SlidersHorizontal, Bell, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";

export function MobileBottomNav() {
  const items = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/analytics", label: "Analytics", icon: SlidersHorizontal },
    { to: "/dashboard#alerts", label: "Alerts", icon: Bell },
    { to: "/settings", label: "Settings", icon: Settings }
  ];

  return (
    <nav className="glass-card fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-2xl px-3 py-2 lg:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "rounded-xl p-2 transition-all",
              isActive ? "bg-cyan-400/15 text-cyan-200" : "text-slate-200 hover:bg-cyan-400/10 hover:text-cyan-200"
            )
          }
          aria-label={item.label}
        >
          <item.icon size={18} />
        </NavLink>
      ))}
    </nav>
  );
}
