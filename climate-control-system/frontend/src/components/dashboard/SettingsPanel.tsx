import { Bell, ShieldCheck, Sliders } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { ToggleSwitch } from "../ui/ToggleSwitch";

interface SettingsPanelProps {
  compactMode: boolean;
  onCompactMode: (value: boolean) => void;
  notifications: boolean;
  onNotifications: (value: boolean) => void;
}

export function SettingsPanel({ compactMode, onCompactMode, notifications, onNotifications }: SettingsPanelProps) {
  return (
    <GlassCard className="h-full">
      <h3 className="mb-3 text-base font-semibold">Settings</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-white/10 p-3">
          <div className="flex items-center gap-2">
            <Sliders size={15} className="text-cyan-300" />
            <div>
              <p className="text-sm">Compact cards</p>
              <p className="text-xs text-subtle">Reduce dashboard density</p>
            </div>
          </div>
          <ToggleSwitch checked={compactMode} onChange={onCompactMode} />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-white/10 p-3">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-cyan-300" />
            <div>
              <p className="text-sm">Notifications</p>
              <p className="text-xs text-subtle">Toast alerts + warnings</p>
            </div>
          </div>
          <ToggleSwitch checked={notifications} onChange={onNotifications} />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-xs">
          <ShieldCheck size={15} className="text-emerald-300" />
          Control session is authenticated
        </div>
      </div>
    </GlassCard>
  );
}
