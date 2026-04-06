export type PowerState = "on" | "off";

export interface Device {
  id: number;
  name: string;
  serial_number: string;
  status: "online" | "offline";
  fan_status: PowerState;
  ac_status: PowerState;
}

export interface SensorReading {
  id: number;
  device_id: number;
  temperature: number;
  humidity: number;
  fan_status: PowerState;
  ac_status: PowerState;
  recorded_at: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface ChartPoint {
  time: string;
  temperature: number;
  humidity: number;
}

export interface AlertItem {
  id: string;
  type: "warning" | "critical" | "info";
  title: string;
  message: string;
  timestamp: string;
}

export interface DeviceControlPayload {
  fanStatus?: PowerState;
  acStatus?: PowerState;
}
