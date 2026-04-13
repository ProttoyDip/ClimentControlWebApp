import { useMemo, useState } from "react";
import { Bell, ShieldCheck, SunMedium, ThermometerSun, Waves } from "lucide-react";
import { AnimatedItem, AnimatedStagger } from "../components/animations/AnimatedStagger";
import { AppShell } from "../components/layout/AppShell";
import { Topbar } from "../components/layout/Topbar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { Slider } from "../components/ui/Slider";
import { ToggleSwitch } from "../components/ui/ToggleSwitch";
import { useDashboardStore } from "../store/dashboardStore";
import { useShallow } from "zustand/react/shallow";

export function SettingsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, sidebarCollapsed, toggleTheme, setSidebarCollapsed, targetTemps, setTargetTemp } = useDashboardStore(
    useShallow((state) => ({
      theme: state.theme,
      sidebarCollapsed: state.sidebarCollapsed,
      targetTemps: state.targetTemps,
      toggleTheme: state.toggleTheme,
      setSidebarCollapsed: state.setSidebarCollapsed,
      setTargetTemp: state.setTargetTemp
    }))
  );

  const [notifications, setNotifications] = useState(true);
  const [compact, setCompact] = useState(false);

  const baselineTarget = useMemo(() => {
    const values = Object.values(targetTemps);
    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 22;
  }, [targetTemps]);

  return (
    <AppShell
      sidebarCollapsed={sidebarCollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    >
      <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} theme={theme} onToggleTheme={toggleTheme} />
      <AnimatedStagger className="space-y-4">
        <AnimatedItem>
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.24em] text-subtle">Settings</p>
            <h1 className="mt-2 text-3xl font-semibold">Dashboard preferences and climate defaults</h1>
            <p className="mt-2 max-w-2xl text-sm text-subtle">
              Tune the visual experience and control defaults without leaving the dashboard.
            </p>
          </GlassCard>
        </AnimatedItem>

        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <AnimatedItem>
            <GlassCard className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-subtle">Experience</p>
                <h2 className="mt-1 text-xl font-semibold">UI controls</h2>
              </div>
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Dark mode</p>
                    <p className="text-xs text-subtle">Persisted across sessions</p>
                  </div>
                  <Button variant="ghost" className="!p-2" onClick={toggleTheme}>
                    <SunMedium size={16} />
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Compact density</p>
                    <p className="text-xs text-subtle">Reduce spacing for dense monitoring</p>
                  </div>
                  <ToggleSwitch checked={compact} onChange={setCompact} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Notifications</p>
                    <p className="text-xs text-subtle">Toast alerts and device warnings</p>
                  </div>
                  <ToggleSwitch checked={notifications} onChange={setNotifications} />
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-subtle">
                <p className="flex items-center gap-2 font-medium text-slate-100">
                  <ShieldCheck size={16} className="text-emerald-300" />
                  Authenticated dashboard session
                </p>
                <p className="mt-2">Settings are applied locally and synced instantly with the current dashboard session.</p>
              </div>
            </GlassCard>
          </AnimatedItem>

          <AnimatedItem>
            <GlassCard className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-subtle">Climate defaults</p>
                <h2 className="mt-1 text-xl font-semibold">Target temperature presets</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-subtle">Baseline target</p>
                  <p className="mt-2 text-3xl font-semibold">{baselineTarget}°C</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-subtle">Priority mode</p>
                  <Badge label="balanced" tone="online" />
                </div>
              </div>
              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2"><ThermometerSun size={15} className="text-cyan-300" /> Target temperature</span>
                    <span className="font-semibold">{baselineTarget}°C</span>
                  </div>
                  <div className="mt-3">
                    <Slider value={baselineTarget} onChange={(value) => setTargetTemp(1, value)} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-subtle"><Waves size={15} className="text-sky-300" /> Humidity smoothing</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-subtle">Auto</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-4 text-sm text-subtle">
                  The current backend receives target updates through the same realtime control channel used by the dashboard.
                </div>
              </div>
            </GlassCard>
          </AnimatedItem>
        </div>
      </AnimatedStagger>
    </AppShell>
  );
}
