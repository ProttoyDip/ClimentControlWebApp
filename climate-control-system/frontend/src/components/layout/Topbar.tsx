import { Menu, MoonStar, SunMedium, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

interface TopbarProps {
  onOpenMobileMenu: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Topbar({ onOpenMobileMenu, theme, onToggleTheme }: TopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="glass-card mb-4 flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="!p-2 lg:hidden" onClick={onOpenMobileMenu}>
          <Menu size={17} />
        </Button>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-subtle">Operations</p>
          <h2 className="text-lg font-semibold">Climate Control Dashboard</h2>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="!p-2" onClick={onToggleTheme}>
          {theme === "dark" ? <SunMedium size={16} /> : <MoonStar size={16} />}
        </Button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{user?.name || "Operator"}</p>
          <p className="text-xs text-subtle">Live control session</p>
        </div>
        <Button variant="ghost" className="!p-2" onClick={logout}>
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
}
