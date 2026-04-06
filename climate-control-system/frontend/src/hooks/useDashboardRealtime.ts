import { useCallback, useEffect } from "react";
import { api } from "../services/api";
import { getSocket } from "../services/socket";
import { useDashboardStore } from "../store/dashboardStore";
import { Device, DeviceControlPayload, SensorReading } from "../types";

export function useDashboardRealtime() {
  const {
    setDevices,
    setReadings,
    addReading,
    upsertDevice,
    addAlert,
    setLoading,
    setError,
    setDevicePower
  } = useDashboardStore((state) => ({
    setDevices: state.setDevices,
    setReadings: state.setReadings,
    addReading: state.addReading,
    upsertDevice: state.upsertDevice,
    addAlert: state.addAlert,
    setLoading: state.setLoading,
    setError: state.setError,
    setDevicePower: state.setDevicePower
  }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [devicesRes, readingsRes] = await Promise.all([api.get("/devices"), api.get("/sensors/latest?limit=48")]);
      setDevices(devicesRes.data.data as Device[]);
      setReadings(readingsRes.data.data as SensorReading[]);
      setError(null);
    } catch {
      setError("Could not load dashboard data");
      addAlert({
        type: "critical",
        title: "Connection issue",
        message: "Failed to sync with backend API"
      });
    } finally {
      setLoading(false);
    }
  }, [addAlert, setDevices, setError, setLoading, setReadings]);

  useEffect(() => {
    load();
    const socket = getSocket();

    const onSensorUpdate = (reading: SensorReading) => {
      addReading(reading);

      if (reading.temperature >= 30) {
        addAlert({
          type: "warning",
          title: "High temperature",
          message: `Temperature reached ${reading.temperature.toFixed(1)} C`
        });
      }
      if (reading.humidity >= 75) {
        addAlert({
          type: "warning",
          title: "Humidity threshold",
          message: `Humidity reached ${reading.humidity.toFixed(1)}%`
        });
      }
    };

    const onDeviceUpdate = (device: Device) => {
      upsertDevice(device);
      addAlert({
        type: "info",
        title: "Device update",
        message: `${device.name} is ${device.status}`
      });
    };

    socket.on("sensor:update", onSensorUpdate);
    socket.on("device:update", onDeviceUpdate);

    return () => {
      socket.off("sensor:update", onSensorUpdate);
      socket.off("device:update", onDeviceUpdate);
    };
  }, [addAlert, addReading, load, upsertDevice]);

  const controlDevice = useCallback(
    async (deviceId: number, payload: DeviceControlPayload) => {
      if (payload.fanStatus) {
        setDevicePower(deviceId, "fan_status", payload.fanStatus);
      }
      if (payload.acStatus) {
        setDevicePower(deviceId, "ac_status", payload.acStatus);
      }

      try {
        await api.post(`/devices/${deviceId}/control`, payload);
      } catch {
        addAlert({
          type: "critical",
          title: "Control failed",
          message: "Device command was not accepted"
        });
        load();
      }
    },
    [addAlert, load, setDevicePower]
  );

  return { load, controlDevice };
}
