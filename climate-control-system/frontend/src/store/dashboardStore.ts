import { create } from "zustand";
import { AlertItem, Device, SensorReading } from "../types";

type ThemeMode = "dark" | "light";

interface DashboardState {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  readings: SensorReading[];
  devices: Device[];
  alerts: AlertItem[];
  loading: boolean;
  error: string | null;
  targetTemps: Record<number, number>;
  heaterState: Record<number, boolean>;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  setReadings: (readings: SensorReading[]) => void;
  addReading: (reading: SensorReading) => void;
  setDevices: (devices: Device[]) => void;
  upsertDevice: (device: Device) => void;
  setDevicePower: (id: number, mode: "fan_status" | "ac_status", value: "on" | "off") => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addAlert: (alert: Omit<AlertItem, "id" | "timestamp">) => void;
  dismissAlert: (id: string) => void;
  setTargetTemp: (id: number, value: number) => void;
  setHeaterState: (id: number, value: boolean) => void;
}

const storedTheme = localStorage.getItem("theme") as ThemeMode | null;
const initialTheme: ThemeMode = storedTheme ?? "dark";

export const useDashboardStore = create<DashboardState>((set) => ({
  theme: initialTheme,
  sidebarCollapsed: false,
  readings: [],
  devices: [],
  alerts: [],
  loading: true,
  error: null,
  targetTemps: {},
  heaterState: {},
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const theme: ThemeMode = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", theme);
      return { theme };
    }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setReadings: (readings) => set({ readings }),
  addReading: (reading) =>
    set((state) => ({
      readings: [reading, ...state.readings].slice(0, 48)
    })),
  setDevices: (devices) =>
    set((state) => {
      const targetTemps = { ...state.targetTemps };
      const heaterState = { ...state.heaterState };
      devices.forEach((device) => {
        if (targetTemps[device.id] === undefined) targetTemps[device.id] = 22;
        if (heaterState[device.id] === undefined) heaterState[device.id] = false;
      });
      return { devices, targetTemps, heaterState };
    }),
  upsertDevice: (device) =>
    set((state) => {
      const next = state.devices.some((entry) => entry.id === device.id)
        ? state.devices.map((entry) => (entry.id === device.id ? device : entry))
        : [device, ...state.devices];
      return { devices: next };
    }),
  setDevicePower: (id, mode, value) =>
    set((state) => ({
      devices: state.devices.map((device) =>
        device.id === id
          ? {
              ...device,
              [mode]: value
            }
          : device
      )
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [
        {
          ...alert,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        },
        ...state.alerts
      ].slice(0, 6)
    })),
  dismissAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id)
    })),
  setTargetTemp: (id, value) =>
    set((state) => ({
      targetTemps: {
        ...state.targetTemps,
        [id]: value
      }
    })),
  setHeaterState: (id, value) =>
    set((state) => ({
      heaterState: {
        ...state.heaterState,
        [id]: value
      }
    }))
}));
