import { Menu, MoonStar, SunMedium, LogOut, Bell, CircleUserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

interface TopbarProps {
  onOpenMobileMenu: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Topbar({ onOpenMobileMenu, theme, onToggleTheme }: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const lightModeActionClass =
    theme === "light"
      ? "!text-blue-600 hover:!text-blue-700 hover:!bg-blue-100/70"
      : "";

  return (
    <header className="glass-card mb-4 flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="!p-2 lg:hidden" onClick={onOpenMobileMenu}>
          <Menu size={17} />
        </Button>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-subtle">Operations console</p>
          <h2 className="text-lg font-semibold">Smart Room Climate Dashboard</h2>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className={`hidden !p-2 sm:inline-flex ${lightModeActionClass}`}
          onClick={() => navigate("/notifications")}
        >
          <Bell size={16} />
        </Button>
        <Button variant="ghost" className={`!p-2 ${lightModeActionClass}`} onClick={onToggleTheme}>
          {theme === "dark" ? <SunMedium size={16} /> : <MoonStar size={16} />}
        </Button>
        <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 sm:flex">
          <CircleUserRound size={18} className="text-cyan-300" />
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name || "Operator"}</p>
            <p className="text-xs text-subtle">{user?.role === "admin" ? "Admin session" : "Live control session"}</p>
          </div>
        </div>
        {user?.role === "admin" ? (
          <Link className="hidden text-xs text-cyan-300 sm:block" to="/admin">
            Admin
          </Link>
        ) : null}
        <Button variant="ghost" className={`!p-2 ${lightModeActionClass}`} onClick={logout}>
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
}
