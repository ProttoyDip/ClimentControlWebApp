import { useEffect, useMemo, useState } from "react";
import { Activity, RefreshCw, TriangleAlert } from "lucide-react";
import { AnimatedItem, AnimatedStagger } from "../components/animations/AnimatedStagger";
import { ClimateTrendChart } from "../components/charts/ClimateTrendChart";
import { AlertStack } from "../components/dashboard/AlertStack";
import { DashboardSkeleton } from "../components/dashboard/DashboardSkeleton";
import { DeviceControlPanel } from "../components/dashboard/DeviceControlPanel";
import { EmptyState } from "../components/dashboard/EmptyState";
import { SettingsPanel } from "../components/dashboard/SettingsPanel";
import { StatsCards } from "../components/dashboard/StatsCards";
import { AppShell } from "../components/layout/AppShell";
import { Topbar } from "../components/layout/Topbar";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { useDashboardRealtime } from "../hooks/useDashboardRealtime";
import { useDashboardStore } from "../store/dashboardStore";
import { ChartPoint } from "../types";
import { computeEnergyUsage, formatKwh, formatRelativeClock } from "../utils/format";

export function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const {
    theme,
    sidebarCollapsed,
    readings,
    devices,
    loading,
    error,
    targetTemps,
    heaterState,
    setTheme,
    setSidebarCollapsed,
    setTargetTemp,
    setHeaterState
  } = useDashboardStore((state) => ({
    theme: state.theme,
    sidebarCollapsed: state.sidebarCollapsed,
    readings: state.readings,
    devices: state.devices,
    loading: state.loading,
    error: state.error,
    targetTemps: state.targetTemps,
    heaterState: state.heaterState,
    setTheme: state.setTheme,
    setSidebarCollapsed: state.setSidebarCollapsed,
    setTargetTemp: state.setTargetTemp,
    setHeaterState: state.setHeaterState
  }));

  const { load, controlDevice } = useDashboardRealtime();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
  }, [theme]);

  const latest = readings[0];
  const avgTemp = useMemo(() => {
    if (!readings.length) return "--";
    return `${(readings.reduce((sum, item) => sum + item.temperature, 0) / readings.length).toFixed(1)} C`;
  }, [readings]);

  const avgHumidity = useMemo(() => {
    if (!readings.length) return "--";
    return `${(readings.reduce((sum, item) => sum + item.humidity, 0) / readings.length).toFixed(1)} %`;
  }, [readings]);

  const activeDevices = devices.filter((device) => device.status === "online").length;
  const energyUsage = formatKwh(computeEnergyUsage(latest?.temperature ?? 23, latest?.humidity ?? 52, activeDevices));

  const chartData: ChartPoint[] = useMemo(
    () =>
      [...readings]
        .reverse()
        .slice(-20)
        .map((reading) => ({
          time: formatRelativeClock(reading.recorded_at),
          temperature: Number(reading.temperature.toFixed(2)),
          humidity: Number(reading.humidity.toFixed(2))
        })),
    [readings]
  );

  return (
    <>
      {notifications ? <AlertStack /> : null}
      <AppShell
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      >
        <Topbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          theme={theme}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        />

        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <GlassCard className="flex min-h-[280px] items-center justify-center">
            <div className="text-center">
              <TriangleAlert size={28} className="mx-auto mb-2 text-red-300" />
              <h3 className="text-lg font-semibold">Unable to load dashboard</h3>
              <p className="mt-1 text-sm text-subtle">{error}</p>
              <Button className="mt-4" onClick={load}>
                Retry Sync
              </Button>
            </div>
          </GlassCard>
        ) : (
          <AnimatedStagger className="space-y-3">
            <AnimatedItem>
              <div className={compactMode ? "[&_*]:!py-2" : ""}>
                <StatsCards
                  temperature={avgTemp}
                  humidity={avgHumidity}
                  energyUsage={energyUsage}
                  activeDevices={`${activeDevices}/${devices.length}`}
                />
              </div>
            </AnimatedItem>

            <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
              <AnimatedItem>
                <GlassCard>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold">Realtime Climate Trend</h3>
                      <p className="text-xs text-subtle">Temperature and humidity stream over the latest records</p>
                    </div>
                    <Button variant="ghost" className="!p-2" onClick={load}>
                      <RefreshCw size={15} />
                    </Button>
                  </div>
                  {chartData.length ? (
                    <ClimateTrendChart data={chartData} />
                  ) : (
                    <EmptyState title="No telemetry yet" description="Waiting for sensor packets from connected devices." />
                  )}
                </GlassCard>
              </AnimatedItem>

              <AnimatedItem>
                <SettingsPanel
                  compactMode={compactMode}
                  onCompactMode={setCompactMode}
                  notifications={notifications}
                  onNotifications={setNotifications}
                />
              </AnimatedItem>
            </div>

            <AnimatedItem>
              {devices.length ? (
                <DeviceControlPanel
                  devices={devices}
                  targetTemps={targetTemps}
                  heaterState={heaterState}
                  onSetTargetTemp={setTargetTemp}
                  onSetHeaterState={setHeaterState}
                  onControlDevice={controlDevice}
                />
              ) : (
                <EmptyState
                  title="No devices found"
                  description="Connect a room controller to start controlling HVAC devices in real time."
                />
              )}
            </AnimatedItem>

            {latest ? (
              <AnimatedItem>
                <GlassCard className="flex items-center gap-2 py-3">
                  <Activity size={17} className="text-emerald-300" />
                  <p className="text-sm text-subtle">
                    Last update at {formatRelativeClock(latest.recorded_at)} with {latest.temperature.toFixed(1)} C and {latest.humidity.toFixed(1)}% humidity
                  </p>
                </GlassCard>
              </AnimatedItem>
            ) : null}
          </AnimatedStagger>
        )}
      </AppShell>
    </>
  );
}
