import { ActivitySquare, Bell, Settings, Zap } from "lucide-react";

const quickLinks = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#contact", label: "Contact" }
];

const socialLinks = [
  { href: "#", label: "Updates", icon: Bell },
  { href: "#", label: "Community", icon: ActivitySquare },
  { href: "#", label: "Automation", icon: Zap },
  { href: "#", label: "Platform", icon: Settings }
];

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)]/60">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:px-8 md:py-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-[color:var(--text)]">CLIMATE CONTROL</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-subtle">
            A premium smart room climate platform for modern, connected, and energy-aware living.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Quick Links</p>
          <div className="mt-3 space-y-2">
            {quickLinks.map((item) => (
              <a key={item.href} href={item.href} className="block text-sm text-subtle transition hover:text-[color:var(--text)]">
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Social</p>
          <div className="mt-3 flex items-center gap-2">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)]/50 p-2 text-subtle transition hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-[color:var(--text)]"
              >
                <item.icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <p className="border-t border-[color:var(--border)] py-4 text-center text-xs text-subtle">
        Copyright {new Date().getFullYear()} Climate Control. All rights reserved.
      </p>
    </footer>
  );
}
