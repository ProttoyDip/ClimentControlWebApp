export interface Device {
  id: number;
  name: string;
  serial_number: string;
  status: "online" | "offline";
  fan_status: "on" | "off";
  ac_status: "on" | "off";
}

export interface SensorReading {
  id: number;
  device_id: number;
  temperature: number;
  humidity: number;
  fan_status: "on" | "off";
  ac_status: "on" | "off";
  recorded_at: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}
