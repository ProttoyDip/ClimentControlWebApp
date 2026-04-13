import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";

const items = [
  { to: "/", label: "Home" },
  { to: "/login", label: "Login" },
  { to: "/register", label: "Register" },
  { to: "/contact", label: "Contact" }
];

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <NavLink to="/" className="text-sm font-semibold tracking-[0.16em] text-cyan-200">
          SMART CLIMATE
        </NavLink>

        <div className="flex items-center gap-1 md:gap-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group relative rounded-lg px-3 py-2 text-sm transition-colors",
                  "hover:bg-cyan-300/10 hover:text-cyan-200",
                  isActive ? "bg-cyan-300/10 text-cyan-200" : "text-slate-300"
                )
              }
            >
              <span>{item.label}</span>
              <span className="absolute inset-x-2 -bottom-0.5 h-px origin-left scale-x-0 bg-cyan-300 transition-transform duration-300 group-hover:scale-x-100" />
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}