import { useMemo, useState } from "react";
import { Zap, TrendingUp, BarChart3, Clock } from "lucide-react";
import { AnimatedItem, AnimatedStagger } from "../components/animations/AnimatedStagger";
import { AppShell } from "../components/layout/AppShell";
import { Topbar } from "../components/layout/Topbar";
import { Badge } from "../components/ui/Badge";
import { GlassCard } from "../components/ui/GlassCard";
import { useDashboardRealtime } from "../hooks/useDashboardRealtime";
import { useDashboardStore } from "../store/dashboardStore";
import { useShallow } from "zustand/react/shallow";

export function EnergyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, sidebarCollapsed, readings, toggleTheme, setSidebarCollapsed } = useDashboardStore(
    useShallow((state) => ({
      theme: state.theme,
      sidebarCollapsed: state.sidebarCollapsed,
      readings: state.readings,
      toggleTheme: state.toggleTheme,
      setSidebarCollapsed: state.setSidebarCollapsed
    }))
  );
  const { load } = useDashboardRealtime();

  const energyMetrics = useMemo(() => {
    if (readings.length === 0) return { total: 0, average: 0, peak: 0, current: 0 };

    const temps = readings.map((r) => Number(r.temperature));
    const totalEnergy = temps.reduce((sum, t) => sum + t, 0);
    const avgEnergy = totalEnergy / temps.length;
    const peakEnergy = Math.max(...temps);
    const currentEnergy = temps[0] || 0;

    return {
      total: totalEnergy.toFixed(2),
      average: avgEnergy.toFixed(2),
      peak: peakEnergy.toFixed(2),
      current: currentEnergy.toFixed(2)
    };
  }, [readings]);

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
          <GlassCard className="overflow-hidden p-0">
            <div className="bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.24),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.2),transparent_28%)] p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-subtle">Energy</p>
                  <h1 className="mt-2 text-3xl font-semibold">Consumption analytics</h1>
                  <p className="mt-2 max-w-2xl text-sm text-subtle">Real-time energy metrics and consumption insights</p>
                </div>
                <Zap size={48} className="text-yellow-400 opacity-80" />
              </div>
            </div>
          </GlassCard>
        </AnimatedItem>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatedItem>
            <GlassCard className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.22em] text-subtle">Current</p>
                <Zap size={16} className="text-yellow-400" />
              </div>
              <p className="text-2xl font-semibold">{energyMetrics.current}°</p>
              <Badge label="Active" tone="online" />
            </GlassCard>
          </AnimatedItem>

          <AnimatedItem>
            <GlassCard className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.22em] text-subtle">Average</p>
                <TrendingUp size={16} className="text-blue-400" />
              </div>
              <p className="text-2xl font-semibold">{energyMetrics.average}°</p>
              <Badge label="24h" tone="neutral" />
            </GlassCard>
          </AnimatedItem>

          <AnimatedItem>
            <GlassCard className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.22em] text-subtle">Peak</p>
                <BarChart3 size={16} className="text-red-400" />
              </div>
              <p className="text-2xl font-semibold">{energyMetrics.peak}°</p>
              <Badge label="Today" tone="warning" />
            </GlassCard>
          </AnimatedItem>

          <AnimatedItem>
            <GlassCard className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.22em] text-subtle">Total</p>
                <Clock size={16} className="text-cyan-400" />
              </div>
              <p className="text-2xl font-semibold">{energyMetrics.total}°</p>
              <Badge label="Cumulative" tone="neutral" />
            </GlassCard>
          </AnimatedItem>
        </div>

        <AnimatedItem>
          <GlassCard>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-subtle">Consumption Details</p>
              <h2 className="mt-2 text-xl font-semibold">Energy usage overview</h2>
              <p className="mt-1 text-sm text-subtle">Monitor your system's efficiency and consumption patterns</p>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p>System uptime</p>
                <p className="font-medium">24/7 monitoring active</p>
              </div>
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p>Energy efficiency</p>
                <p className="font-medium">Optimized</p>
              </div>
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p>Last update</p>
                <p className="font-medium">Real-time</p>
              </div>
            </div>
          </GlassCard>
        </AnimatedItem>
      </AnimatedStagger>
    </AppShell>
  );
}
