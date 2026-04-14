import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  CircleGauge,
  CloudSun,
  RefreshCw,
  Thermometer,
  TriangleAlert,
  Waves,
  Zap
} from "lucide-react";
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
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { useDashboardRealtime } from "../hooks/useDashboardRealtime";
import { useDashboardStore } from "../store/dashboardStore";
import { ChartPoint } from "../types";
import { computeEnergyUsage, formatKwh, formatRelativeClock } from "../utils/format";
import { useShallow } from "zustand/react/shallow";

function clampTarget(value: number) {
  if (Number.isNaN(value)) return 22;
  return Math.min(30, Math.max(16, value));
}

export function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const {
    theme,
    notificationsEnabled,
    sidebarCollapsed,
    readings,
    devices,
    loading,
    error,
    connectionStatus,
    targetTemps,
    heaterState,
    setTheme,
    toggleTheme,
    setNotificationsEnabled,
    setSidebarCollapsed,
    setTargetTemp,
    setHeaterState,
    addAlert
  } = useDashboardStore(
    useShallow((state) => ({
      theme: state.theme,
      notificationsEnabled: state.notificationsEnabled,
      sidebarCollapsed: state.sidebarCollapsed,
      readings: state.readings,
      devices: state.devices,
      loading: state.loading,
      error: state.error,
      connectionStatus: state.connectionStatus,
      targetTemps: state.targetTemps,
      heaterState: state.heaterState,
      setTheme: state.setTheme,
      toggleTheme: state.toggleTheme,
      setNotificationsEnabled: state.setNotificationsEnabled,
      setSidebarCollapsed: state.setSidebarCollapsed,
      setTargetTemp: state.setTargetTemp,
      setHeaterState: state.setHeaterState,
      addAlert: state.addAlert
    }))
  );

  const { load, controlDevice, ingestStatusBySerial } = useDashboardRealtime();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const latest = readings[0];
  const currentTarget = useMemo(() => {
    const values = Object.values(targetTemps);
    if (!values.length) return 22;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }, [targetTemps]);

  const avgTemp = useMemo(() => {
    if (!readings.length) return "--";
    return `${(readings.reduce((sum, item) => sum + item.temperature, 0) / readings.length).toFixed(1)}°C`;
  }, [readings]);

  const avgHumidity = useMemo(() => {
    if (!readings.length) return "--";
    return `${(readings.reduce((sum, item) => sum + item.humidity, 0) / readings.length).toFixed(1)}%`;
  }, [readings]);

  const activeDevices = devices.filter((device) => device.status === "online").length;
  const coolingActive = Boolean(latest && latest.temperature > currentTarget && devices.some((device) => device.ac_status === "on"));
  const systemMode = !latest ? "Idle" : coolingActive ? "Cooling" : activeDevices ? "Monitoring" : "Idle";
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

  const connectionTone = connectionStatus === "connected" ? "online" : connectionStatus === "connecting" ? "warning" : "offline";

  return (
    <>
      {notificationsEnabled ? <AlertStack /> : null}
      <AppShell
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      >
        <Topbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <GlassCard className="min-h-[320px] overflow-hidden p-0">
            <div className="grid min-h-[320px] place-items-center bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_50%)] p-6 text-center">
              <div className="max-w-md">
                <TriangleAlert size={34} className="mx-auto text-red-300" />
                <h3 className="mt-4 text-2xl font-semibold">Unable to load dashboard</h3>
                <p className="mt-2 text-sm text-subtle">{error}</p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <Button onClick={load}>Retry sync</Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      addAlert({
                        type: "info",
                        title: "Manual refresh",
                        message: "Trying to reconnect to live telemetry"
                      })
                    }
                  >
                    Notify me
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        ) : (
          <AnimatedStagger className="space-y-4">
            <AnimatedItem>
              <GlassCard className="overflow-hidden p-0">
                <div className="relative overflow-hidden rounded-2xl p-6 md:p-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.22),transparent_32%),radial-gradient(circle_at_90%_20%,rgba(37,99,235,0.26),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.2),rgba(15,23,42,0.05))]" />
                  <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge label={connectionStatus} tone={connectionTone} />
                        <Badge label={systemMode} tone={coolingActive ? "warning" : "online"} />
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-subtle">
                          Smart room telemetry synced in real time
                        </span>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-subtle">Premium climate operations</p>
                        <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">
                          Monitor room climate and control every device from one elegant dashboard.
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm text-subtle md:text-base">
                          Live temperature, humidity, and HVAC control with smooth motion, dark mode, and production-ready realtime sync.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button onClick={load} className="inline-flex items-center gap-2">
                          <RefreshCw size={16} />
                          Refresh telemetry
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            addAlert({
                              type: "info",
                              title: "System check",
                              message: `Mode ${systemMode}, ${activeDevices} active devices`
                            })
                          }
                          className="inline-flex items-center gap-2"
                        >
                          <Activity size={16} />
                          Quick status
                        </Button>
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 24 }}
                      className="grid gap-3 sm:grid-cols-2"
                    >
                      <GlassCard className="!p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Room temperature</p>
                        <div className="mt-3 flex items-end gap-3">
                          <Thermometer className="text-cyan-300" size={24} />
                          <div>
                            <p className="text-4xl font-semibold">{latest ? `${latest.temperature.toFixed(1)}°` : "--"}</p>
                            <p className="text-sm text-subtle">Target {currentTarget}°C</p>
                          </div>
                        </div>
                      </GlassCard>
                      <GlassCard className="!p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Humidity</p>
                        <div className="mt-3 flex items-end gap-3">
                          <Waves className="text-sky-300" size={24} />
                          <div>
                            <p className="text-4xl font-semibold">{latest ? `${latest.humidity.toFixed(0)}%` : "--"}</p>
                            <p className="text-sm text-subtle">Average {avgHumidity}</p>
                          </div>
                        </div>
                      </GlassCard>
                      <GlassCard className="!p-4 sm:col-span-2">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-subtle">System mode</p>
                            <p className="mt-2 text-2xl font-semibold">{systemMode}</p>
                          </div>
                          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
                            <CircleGauge size={22} />
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                            <p className="text-xs text-subtle">Energy</p>
                            <p className="mt-1 font-semibold">{energyUsage}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                            <p className="text-xs text-subtle">Devices</p>
                            <p className="mt-1 font-semibold">{activeDevices}/{devices.length}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                            <p className="text-xs text-subtle">Avg temp</p>
                            <p className="mt-1 font-semibold">{avgTemp}</p>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  </div>
                </div>
              </GlassCard>
            </AnimatedItem>

            <AnimatedItem>
              <StatsCards
                temperature={avgTemp}
                humidity={avgHumidity}
                energyUsage={energyUsage}
                activeDevices={`${activeDevices}/${devices.length}`}
              />
            </AnimatedItem>

            <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
              <AnimatedItem>
                <GlassCard className="h-full">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-subtle">Realtime analytics</p>
                      <h3 className="mt-1 text-xl font-semibold">Temperature vs humidity</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" className="!px-3 !py-2 text-xs" onClick={load}>
                        <RefreshCw size={14} />
                        Sync
                      </Button>
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                        {readings.length} samples
                      </span>
                    </div>
                  </div>
                  {chartData.length ? (
                    <ClimateTrendChart data={chartData} />
                  ) : (
                    <EmptyState title="No telemetry yet" description="Waiting for sensor packets from connected devices." />
                  )}
                </GlassCard>
              </AnimatedItem>

              <AnimatedItem>
                <GlassCard className="h-full space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-subtle">System status</p>
                    <h3 className="mt-1 text-xl font-semibold">Live control state</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-subtle">Connection</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-medium">{connectionStatus}</span>
                        <Badge label={connectionStatus} tone={connectionTone} />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-subtle">Target climate</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-medium">{currentTarget}°C</span>
                        <span className="text-xs text-subtle">Average target</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${Math.min(100, (currentTarget - 16) * 8.3)}%` }} />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-subtle">Latest update</p>
                      <p className="mt-2 text-sm font-medium">{latest ? formatRelativeClock(latest.recorded_at) : "Waiting for data"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-subtle">Automation</p>
                      <div className="mt-2 flex items-center gap-2 text-sm font-medium">
                        <Zap size={16} className={coolingActive ? "text-cyan-300" : "text-slate-400"} />
                        {coolingActive ? "Cooling engaged" : "Auto-maintain idle"}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4 text-sm text-subtle">
                    <p className="flex items-center gap-2 font-medium text-slate-100">
                      <ArrowUpRight size={16} className="text-cyan-300" />
                      Production-ready telemetry flow
                    </p>
                    <p className="mt-2">
                      Commands are pushed through the realtime layer with optimistic UI updates and live status reconciliation.
                    </p>
                  </div>
                </GlassCard>
              </AnimatedItem>
            </div>

            <AnimatedItem>
              {devices.length ? (
                <DeviceControlPanel
                  devices={devices}
                  ingestStatusBySerial={ingestStatusBySerial}
                  targetTemps={targetTemps}
                  heaterState={heaterState}
                  onSetTargetTemp={(id, value) => setTargetTemp(id, clampTarget(value))}
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

            <AnimatedItem>
              <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
                <SettingsPanel
                  compactMode={compactMode}
                  onCompactMode={setCompactMode}
                  notifications={notificationsEnabled}
                  onNotifications={setNotificationsEnabled}
                />
                <GlassCard>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-subtle">Status feed</p>
                      <h3 className="mt-1 text-xl font-semibold">Recent telemetry notes</h3>
                    </div>
                    <Badge label="active" tone="online" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {(readings.slice(0, 3).length ? readings.slice(0, 3) : []).map((reading) => (
                      <div key={reading.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">Device #{reading.device_id}</p>
                          <p className="text-xs text-subtle">{formatRelativeClock(reading.recorded_at)}</p>
                        </div>
                        <div className="text-right text-sm text-subtle">
                          <p>{reading.temperature.toFixed(1)}°C</p>
                          <p>{reading.humidity.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                    {!readings.length ? (
                      <EmptyState title="No recent readings" description="Telemetry will appear here once the device posts data." />
                    ) : null}
                  </div>
                </GlassCard>
              </div>
            </AnimatedItem>

            {latest ? (
              <AnimatedItem>
                <GlassCard className="flex items-center gap-3 py-4">
                  <CloudSun size={18} className="text-cyan-300" />
                  <p className="text-sm text-subtle">
                    Last update at {formatRelativeClock(latest.recorded_at)} with {latest.temperature.toFixed(1)}°C and {latest.humidity.toFixed(1)}% humidity.
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
