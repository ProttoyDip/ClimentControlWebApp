import { Menu, MoonStar, SunMedium, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

interface NavbarProps {
  primaryCtaTo: string;
}

const navItems = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#contact", label: "Contact" }
];

export function Navbar({ primaryCtaTo }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((value) => (value === "dark" ? "light" : "dark"));
  };

  const shellClass = scrolled
    ? "border-white/55 bg-white/78 text-slate-900 shadow-[0_18px_44px_rgba(15,23,42,0.16)] backdrop-blur-2xl"
    : "border-transparent bg-transparent text-[color:var(--text)]";

  const actionClass = scrolled
    ? "!text-slate-800 hover:!text-slate-950 hover:!bg-slate-900/5"
    : "";

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${shellClass}`}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.7)]" />
          <span className={`text-sm font-semibold tracking-[0.2em] ${scrolled ? "text-slate-900" : "text-[color:var(--text)]"}`}>
            CLIMATE CONTROL
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`group relative rounded-lg px-4 py-2 text-sm transition-colors ${
                scrolled ? "text-slate-700 hover:text-slate-950" : "text-subtle hover:text-[color:var(--text)]"
              }`}
            >
              {item.label}
              <span className="absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 bg-cyan-500 transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="ghost"
            className={`!rounded-xl !px-3 !py-2 ${actionClass}`}
            onClick={toggleTheme}
            aria-label="Toggle light and dark theme"
          >
            {theme === "dark" ? <SunMedium size={16} /> : <MoonStar size={16} />}
          </Button>
          <Link to="/login" aria-label="Login">
            <Button variant="ghost" className={`!rounded-xl !px-4 !py-2 ${actionClass}`}>Login</Button>
          </Link>
          <Link to="/register" aria-label="Register">
            <Button className="!rounded-xl !px-5 !py-2">Register</Button>
          </Link>
          <Link to={primaryCtaTo} aria-label="Open dashboard">
            <Button variant="ghost" className={`!rounded-xl !px-4 !py-2 ${actionClass}`}>Dashboard</Button>
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          className="rounded-lg border border-[color:var(--border)] p-2 text-[color:var(--text)] lg:hidden"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {menuOpen ? (
        <div className={`border-t px-4 py-4 lg:hidden ${scrolled ? "border-slate-200/70 bg-white/88 text-slate-900" : "border-white/10 bg-slate-950/90 text-[color:var(--text)]"}`}>
          <div className="mb-3">
            <Button
              variant="ghost"
              className={`w-full ${actionClass}`}
              onClick={toggleTheme}
              aria-label="Toggle light and dark theme"
            >
              {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </Button>
          </div>
          <div className="space-y-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm transition hover:bg-cyan-400/10 ${scrolled ? "text-slate-800" : "text-[color:var(--text)]"}`}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className={`w-full ${actionClass}`}>Login</Button>
            </Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}>
              <Button className="w-full">Register</Button>
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
