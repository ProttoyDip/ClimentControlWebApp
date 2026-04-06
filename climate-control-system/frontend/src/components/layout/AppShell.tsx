import { ReactNode } from "react";
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
  return (
    <div className="relative min-h-screen p-3 lg:p-4">
      <div className="mx-auto flex max-w-[1500px] gap-4">
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
