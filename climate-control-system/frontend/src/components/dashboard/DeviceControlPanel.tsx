import { motion } from "framer-motion";
import { Flame, Snowflake, Wind } from "lucide-react";
import { Device, DeviceControlPayload } from "../../types";
import { Badge } from "../ui/Badge";
import { GlassCard } from "../ui/GlassCard";
import { Slider } from "../ui/Slider";
import { ToggleSwitch } from "../ui/ToggleSwitch";

interface DeviceControlPanelProps {
  devices: Device[];
  targetTemps: Record<number, number>;
  heaterState: Record<number, boolean>;
  onSetTargetTemp: (id: number, value: number) => void;
  onSetHeaterState: (id: number, value: boolean) => void;
  onControlDevice: (id: number, payload: DeviceControlPayload) => void;
}

export function DeviceControlPanel({
  devices,
  targetTemps,
  heaterState,
  onSetTargetTemp,
  onSetHeaterState,
  onControlDevice
}: DeviceControlPanelProps) {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      {devices.map((device) => (
        <GlassCard key={device.id}>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">{device.name}</h3>
              <p className="text-xs text-subtle">Serial: {device.serial_number}</p>
            </div>
            <Badge label={device.status} tone={device.status === "online" ? "online" : "offline"} />
          </div>

          <div className="space-y-3">
            <motion.div whileHover={{ scale: 1.01 }} className="flex items-center justify-between rounded-xl border border-white/10 p-3">
              <div className="flex items-center gap-2">
                <Wind size={15} className="text-cyan-300" />
                <span className="text-sm">Fan</span>
              </div>
              <ToggleSwitch
                checked={device.fan_status === "on"}
                onChange={(value) => onControlDevice(device.id, { fanStatus: value ? "on" : "off" })}
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }} className="flex items-center justify-between rounded-xl border border-white/10 p-3">
              <div className="flex items-center gap-2">
                <Snowflake size={15} className="text-blue-300" />
                <span className="text-sm">AC</span>
              </div>
              <ToggleSwitch
                checked={device.ac_status === "on"}
                onChange={(value) => onControlDevice(device.id, { acStatus: value ? "on" : "off" })}
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }} className="flex items-center justify-between rounded-xl border border-white/10 p-3">
              <div className="flex items-center gap-2">
                <Flame size={15} className="text-amber-300" />
                <span className="text-sm">Heater</span>
              </div>
              <ToggleSwitch checked={Boolean(heaterState[device.id])} onChange={(value) => onSetHeaterState(device.id, value)} />
            </motion.div>

            <Slider value={targetTemps[device.id] ?? 22} onChange={(value) => onSetTargetTemp(device.id, value)} />
          </div>
        </GlassCard>
      ))}
    </section>
  );
}
