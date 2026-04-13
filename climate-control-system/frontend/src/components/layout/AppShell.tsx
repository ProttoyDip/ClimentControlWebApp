import { CSSProperties, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";

interface AppShellProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
  children: ReactNode;
}

export function AppShell({
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
  children
}: AppShellProps) {
  const desktopSidebarWidth = sidebarCollapsed ? 88 : 260;

  return (
    <div
      className="relative min-h-screen overflow-hidden p-3 lg:p-4"
      style={{ "--sidebar-width": `${desktopSidebarWidth}px` } as CSSProperties}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.15),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(37,99,235,0.2),transparent_25%),linear-gradient(180deg,rgba(15,23,42,0.1),transparent_40%)]" />
      <div className="mx-auto max-w-[1600px] lg:pl-[var(--sidebar-width)]">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <AnimatePresence>
          {mobileMenuOpen ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.aside
                initial={{ x: -280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -280, opacity: 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 24 }}
                className="fixed inset-y-3 left-3 z-40 w-64 lg:hidden"
              >
                <Sidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} mobile />
              </motion.aside>
            </>
          ) : null}
        </AnimatePresence>

        <main className="w-full pb-20 lg:pb-0">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
