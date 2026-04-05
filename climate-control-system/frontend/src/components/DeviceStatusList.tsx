import { Device } from "../types";

interface DeviceStatusListProps {
  devices: Device[];
  onControl: (deviceId: number, payload: { fanStatus?: "on" | "off"; acStatus?: "on" | "off" }) => void;
}

export function DeviceStatusList({ devices, onControl }: DeviceStatusListProps) {
  return (
    <section className="panel">
      <h2>Device Controls</h2>
      <div className="device-grid">
        {devices.map((device) => (
          <article key={device.id} className="device-card">
            <header>
              <h3>{device.name}</h3>
              <span className={`status-pill status-pill--${device.status}`}>{device.status}</span>
            </header>
            <p>Serial: {device.serial_number}</p>
            <p>Fan: {device.fan_status.toUpperCase()}</p>
            <p>AC: {device.ac_status.toUpperCase()}</p>
            <div className="control-buttons">
              <button onClick={() => onControl(device.id, { fanStatus: device.fan_status === "on" ? "off" : "on" })}>
                Toggle Fan
              </button>
              <button onClick={() => onControl(device.id, { acStatus: device.ac_status === "on" ? "off" : "on" })}>
                Toggle AC
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
