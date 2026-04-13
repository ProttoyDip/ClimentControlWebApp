import { useMemo, useState } from "react";
import { Activity, Gauge, RefreshCw, ThermometerSun, Waves } from "lucide-react";
import { AnimatedItem, AnimatedStagger } from "../components/animations/AnimatedStagger";
import { ClimateTrendChart } from "../components/charts/ClimateTrendChart";
import { AppShell } from "../components/layout/AppShell";
import { Topbar } from "../components/layout/Topbar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { useDashboardRealtime } from "../hooks/useDashboardRealtime";
import { useDashboardStore } from "../store/dashboardStore";
import { ChartPoint } from "../types";
import { formatRelativeClock } from "../utils/format";
import { useShallow } from "zustand/react/shallow";

export function AnalyticsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, sidebarCollapsed, readings, loading, setTheme, setSidebarCollapsed } = useDashboardStore(
    useShallow((state) => ({
      theme: state.theme,
      sidebarCollapsed: state.sidebarCollapsed,
      readings: state.readings,
      loading: state.loading,
      setTheme: state.setTheme,
      setSidebarCollapsed: state.setSidebarCollapsed
    }))
  );
  const { load } = useDashboardRealtime();

  const chartData: ChartPoint[] = useMemo(
    () =>
      [...readings]
        .reverse()
        .slice(-48)
        .map((reading) => ({
          time: formatRelativeClock(reading.recorded_at),
          temperature: Number(reading.temperature.toFixed(2)),
          humidity: Number(reading.humidity.toFixed(2))
        })),
    [readings]
  );

  const lastTemperature = readings[0]?.temperature ?? 0;
  const lastHumidity = readings[0]?.humidity ?? 0;

  return (
    <AppShell
      sidebarCollapsed={sidebarCollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    >
      <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />
      <AnimatedStagger className="space-y-4">
        <AnimatedItem>
          <GlassCard className="overflow-hidden p-0">
            <div className="bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.24),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.2),transparent_28%)] p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-subtle">Analytics</p>
                  <h1 className="mt-2 text-3xl font-semibold">Climate performance over time</h1>
                  <p className="mt-2 max-w-2xl text-sm text-subtle">
                    Review temperature and humidity response patterns, monitor control effectiveness, and validate your room automation behavior.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label="live" tone="online" />
                  <Button variant="ghost" className="inline-flex items-center gap-2" onClick={load}>
                    <RefreshCw size={15} />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </AnimatedItem>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <AnimatedItem>
            <GlassCard>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-subtle">Trend view</p>
                  <h2 className="mt-1 text-xl font-semibold">Temperature and humidity</h2>
                </div>
                <Button variant="ghost" className="!p-2" onClick={load}>
                  <RefreshCw size={16} />
                </Button>
              </div>
              {chartData.length ? <ClimateTrendChart data={chartData} /> : null}
            </GlassCard>
          </AnimatedItem>

          <AnimatedItem>
            <GlassCard className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-subtle">Snapshot</p>
                <h2 className="mt-1 text-xl font-semibold">Current telemetry</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-subtle">Temperature</p>
                    <ThermometerSun className="text-cyan-300" size={16} />
                  </div>
                  <p className="mt-3 text-3xl font-semibold">{lastTemperature ? `${lastTemperature.toFixed(1)}°C` : "--"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-subtle">Humidity</p>
                    <Waves className="text-sky-300" size={16} />
                  </div>
                  <p className="mt-3 text-3xl font-semibold">{lastHumidity ? `${lastHumidity.toFixed(1)}%` : "--"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-subtle">Status</p>
                    <Gauge className="text-cyan-300" size={16} />
                  </div>
                  <p className="mt-3 text-sm text-subtle">
                    {loading ? "Loading current dataset" : "Current series visualized with live trend interpolation"}
                  </p>
                </div>
              </div>
            </GlassCard>
          </AnimatedItem>
        </div>

        <AnimatedItem>
          <GlassCard>
            <div className="flex items-center gap-2 text-sm text-subtle">
              <Activity size={16} className="text-cyan-300" />
              Interactive chart data is sourced from the same realtime stream that powers the dashboard.
            </div>
          </GlassCard>
        </AnimatedItem>
      </AnimatedStagger>
    </AppShell>
  );
}
