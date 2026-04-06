import { Home, SlidersHorizontal, Bell, Settings } from "lucide-react";

export function MobileBottomNav() {
  return (
    <nav className="glass-card fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-2xl px-3 py-2 lg:hidden">
      {[Home, SlidersHorizontal, Bell, Settings].map((Icon, idx) => (
        <button
          key={idx}
          className="rounded-xl p-2 text-slate-200 transition-all hover:bg-cyan-400/15 hover:text-cyan-200"
          aria-label="navigation item"
        >
          <Icon size={18} />
        </button>
      ))}
    </nav>
  );
}
