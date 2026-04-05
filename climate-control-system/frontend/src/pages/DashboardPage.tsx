import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "../components/DashboardHeader";
import { DeviceStatusList } from "../components/DeviceStatusList";
import { MetricCard } from "../components/MetricCard";
import { useRealtimeReadings } from "../hooks/useRealtimeReadings";
import { api } from "../services/api";
import { Device, SensorReading } from "../types";

export function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);

  const loadData = useCallback(async () => {
    const [devicesResponse, readingsResponse] = await Promise.all([
      api.get("/devices"),
      api.get("/sensors/latest?limit=30")
    ]);

    setDevices(devicesResponse.data.data);
    setReadings(readingsResponse.data.data);
  }, []);

  useEffect(() => {
    loadData().catch(() => {
      setDevices([]);
      setReadings([]);
    });
  }, [loadData]);

  useRealtimeReadings((reading) => {
    setReadings((current) => [reading, ...current].slice(0, 30));
  });

  async function controlDevice(deviceId: number, payload: { fanStatus?: "on" | "off"; acStatus?: "on" | "off" }) {
    await api.post(`/devices/${deviceId}/control`, payload);
    await loadData();
  }

  const averageTemp = useMemo(() => {
    if (!readings.length) {
      return "--";
    }
    const avg = readings.reduce((sum, item) => sum + item.temperature, 0) / readings.length;
    return `${avg.toFixed(1)} C`;
  }, [readings]);

  const averageHumidity = useMemo(() => {
    if (!readings.length) {
      return "--";
    }
    const avg = readings.reduce((sum, item) => sum + item.humidity, 0) / readings.length;
    return `${avg.toFixed(1)} %`;
  }, [readings]);

  const onlineDevices = devices.filter((device) => device.status === "online").length;

  return (
    <main className="dashboard-layout">
      <DashboardHeader />
      <section className="metrics-grid">
        <MetricCard title="Average Temperature" value={averageTemp} subtitle="Live telemetry" />
        <MetricCard title="Average Humidity" value={averageHumidity} subtitle="Last 30 records" />
        <MetricCard
          title="Online Devices"
          value={`${onlineDevices}/${devices.length || 0}`}
          subtitle="Connectivity monitor"
        />
      </section>
      <DeviceStatusList devices={devices} onControl={controlDevice} />
    </main>
  );
}
