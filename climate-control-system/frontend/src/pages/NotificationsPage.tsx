import { useEffect, useMemo, useState } from "react";
import { Bell, BellOff, RefreshCw, TriangleAlert } from "lucide-react";
import { AnimatedItem, AnimatedStagger } from "../components/animations/AnimatedStagger";
import { AppShell } from "../components/layout/AppShell";
import { Topbar } from "../components/layout/Topbar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { ToggleSwitch } from "../components/ui/ToggleSwitch";
import { fetchAlerts, StoredAlert } from "../services/alerts";
import { useDashboardStore } from "../store/dashboardStore";
import { formatLocalDateTime, formatUnixDateTime } from "../utils/format";
import { useShallow } from "zustand/react/shallow";

export function NotificationsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alerts, setAlerts] = useState<StoredAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    theme,
    notificationsEnabled,
    sidebarCollapsed,
    toggleTheme,
    setNotificationsEnabled,
    setSidebarCollapsed
  } = useDashboardStore(
    useShallow((state) => ({
      theme: state.theme,
      notificationsEnabled: state.notificationsEnabled,
      sidebarCollapsed: state.sidebarCollapsed,
      toggleTheme: state.toggleTheme,
      setNotificationsEnabled: state.setNotificationsEnabled,
      setSidebarCollapsed: state.setSidebarCollapsed
    }))
  );

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchAlerts(150);
      setAlerts(data);
      setError(null);
    } catch {
      setError("Could not load notifications history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAlerts();
  }, []);

  const warningCount = useMemo(() => alerts.filter((item) => item.type === "warning").length, [alerts]);
  const errorCount = useMemo(() => alerts.filter((item) => item.type === "error").length, [alerts]);

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
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-subtle">Notifications</p>
                <h1 className="mt-2 text-3xl font-semibold">Notification history and preferences</h1>
                <p className="mt-2 max-w-2xl text-sm text-subtle">
                  Alerts keep recording in the backend. Turn popups on or off anytime without losing history.
                </p>
              </div>
              <Button variant="ghost" onClick={() => void loadAlerts()} className="inline-flex items-center gap-2">
                <RefreshCw size={16} />
                Refresh
              </Button>
            </div>
          </GlassCard>
        </AnimatedItem>

        <div className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
          <AnimatedItem>
            <GlassCard className="space-y-4 xl:sticky xl:top-20">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-subtle">Popup control</p>
                <h2 className="mt-1 text-xl font-semibold">Enable or disable popups</h2>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-sm font-medium">Popup notifications</p>
                  <p className="text-xs text-subtle">
                    {notificationsEnabled ? "Popups are visible on dashboard" : "Popups are hidden, history is still stored"}
                  </p>
                </div>
                <ToggleSwitch checked={notificationsEnabled} onChange={setNotificationsEnabled} />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-subtle">
                <p className="flex items-center gap-2 font-medium text-slate-100">
                  {notificationsEnabled ? <Bell size={16} className="text-cyan-300" /> : <BellOff size={16} className="text-amber-300" />}
                  {notificationsEnabled ? "Popups enabled" : "Popups disabled"}
                </p>
                <p className="mt-2">This setting is saved in your browser and will remain after refresh.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-subtle">Warnings</p>
                  <p className="mt-1 text-xl font-semibold">{warningCount}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-subtle">Errors</p>
                  <p className="mt-1 text-xl font-semibold">{errorCount}</p>
                </div>
              </div>
            </GlassCard>
          </AnimatedItem>

          <AnimatedItem>
            <GlassCard className="max-h-[72vh] overflow-hidden">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-subtle">Timeline</p>
                  <h2 className="mt-1 text-xl font-semibold">Stored notifications</h2>
                </div>
                <Badge label={`${alerts.length} total`} tone="neutral" />
              </div>

              {loading ? <p className="mt-4 text-sm text-subtle">Loading notifications...</p> : null}
              {error ? (
                <div className="mt-4 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-sm">
                  <p className="flex items-center gap-2 font-medium text-red-200">
                    <TriangleAlert size={16} />
                    {error}
                  </p>
                </div>
              ) : null}

              {!loading && !error && alerts.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-subtle">
                  No notifications have been recorded yet.
                </div>
              ) : null}

              {!loading && !error && alerts.length > 0 ? (
                <div className="mt-4 max-h-[56vh] space-y-3 overflow-y-auto pr-1">
                  {alerts.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge label={item.type} tone={item.type === "error" ? "offline" : "warning"} />
                          <span className="text-sm text-subtle">Device #{item.device_id}</span>
                        </div>
                        <span className="text-xs text-subtle">{item.created_at_unix ? formatUnixDateTime(item.created_at_unix) : formatLocalDateTime(item.created_at)}</span>
                      </div>
                      <p className="mt-2 text-sm">{item.message}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </GlassCard>
          </AnimatedItem>
        </div>
      </AnimatedStagger>
    </AppShell>
  );
}
