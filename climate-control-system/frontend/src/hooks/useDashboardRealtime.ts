import { useCallback, useEffect, useRef } from "react";
import { api } from "../services/api";
import { connectSocket, getSocket } from "../services/socket";
import { useDashboardStore } from "../store/dashboardStore";
import { Device, DeviceControlPayload, SensorReading, SocketAlertEvent } from "../types";
import { useShallow } from "zustand/react/shallow";

const MAX_OFFLINE_QUEUE_TIME_MS = 5 * 60 * 1000; // 5 minutes

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeReading(reading: SensorReading): SensorReading {
  return {
    ...reading,
    id: toNumber(reading.id),
    device_id: toNumber(reading.device_id),
    temperature: toNumber(reading.temperature),
    humidity: toNumber(reading.humidity)
  };
}

export function useDashboardRealtime() {
  const {
    setDevices,
    setReadings,
    addReadingsBatch,
    upsertDevice,
    addAlert,
    setLoading,
    setError,
    setDevicePower,
    setConnectionStatus,
    queueCommand,
    getQueuedCommands,
    clearQueuedCommand,
    clearOfflineQueue
  } = useDashboardStore(
    useShallow((state) => ({
      setDevices: state.setDevices,
      setReadings: state.setReadings,
      addReadingsBatch: state.addReadingsBatch,
      upsertDevice: state.upsertDevice,
      addAlert: state.addAlert,
      setLoading: state.setLoading,
      setError: state.setError,
      setDevicePower: state.setDevicePower,
      setConnectionStatus: state.setConnectionStatus,
      queueCommand: state.queueCommand,
      getQueuedCommands: state.getQueuedCommands,
      clearQueuedCommand: state.clearQueuedCommand,
      clearOfflineQueue: state.clearOfflineQueue
    }))
  );

  const bufferedReadingsRef = useRef<SensorReading[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [devicesRes, readingsRes] = await Promise.all([
        api.get("/devices"),
        api.get("/sensors/latest?limit=48")
      ]);
      setDevices(devicesRes.data.data as Device[]);
      const normalizedReadings = (readingsRes.data.data as SensorReading[]).map(normalizeReading);
      setReadings(normalizedReadings);
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

  /**
   * Replay all queued offline commands to the backend.
   * Removes successfully sent commands from queue, keeps failed ones.
   */
  const replayQueuedCommands = useCallback(async () => {
    const commands = getQueuedCommands();
    if (commands.length === 0) return;

    console.info(`[Realtime] Replaying ${commands.length} queued commands`);
    addAlert({
      type: "info",
      title: "Syncing offline commands",
      message: `Sending ${commands.length} queued device commands...`
    });

    for (const command of commands) {
      // Skip commands older than 5 minutes
      if (Date.now() - command.timestamp > MAX_OFFLINE_QUEUE_TIME_MS) {
        console.warn(`[Realtime] Dropping expired command: ${command.id}`);
        clearQueuedCommand(command.id);
        continue;
      }

      try {
        await api.post(`/devices/${command.deviceId}/control`, command.payload);
        clearQueuedCommand(command.id);
        console.debug(`[Realtime] Successfully replayed command: ${command.id}`);
      } catch (error) {
        console.error(`[Realtime] Failed to replay command ${command.id}:`, error);
        // Keep in queue for next retry
      }
    }

    const remaining = getQueuedCommands().length;
    if (remaining === 0) {
      addAlert({
        type: "info",
        title: "Sync complete",
        message: "All queued commands have been sent"
      });
    } else {
      addAlert({
        type: "warning",
        title: "Partial sync",
        message: `${remaining} commands could not be sent yet`
      });
    }
  }, [getQueuedCommands, clearQueuedCommand, addAlert]);

  useEffect(() => {
    load();
    connectSocket();
    const socket = getSocket();

    const flushBufferedReadings = () => {
      if (!bufferedReadingsRef.current.length) {
        return;
      }
      addReadingsBatch(bufferedReadingsRef.current);
      bufferedReadingsRef.current = [];
      flushTimerRef.current = null;
    };

    const onSensorUpdate = (reading: SensorReading) => {
      const normalized = normalizeReading(reading);
      bufferedReadingsRef.current.unshift(normalized);
      if (flushTimerRef.current) {
        return;
      }

      flushTimerRef.current = setTimeout(flushBufferedReadings, 300);

      if (normalized.temperature >= 30) {
        addAlert({
          type: "warning",
          title: "High temperature",
          message: `Temperature reached ${normalized.temperature.toFixed(1)} C`
        });
      }
      if (normalized.humidity >= 75) {
        addAlert({
          type: "warning",
          title: "Humidity threshold",
          message: `Humidity reached ${normalized.humidity.toFixed(1)}%`
        });
      }
    };

    const onAlert = (event: SocketAlertEvent) => {
      addAlert({
        type: event.type === "error" ? "critical" : "warning",
        title: event.title,
        message: event.message
      });
    };

    const onConnect = () => {
      setConnectionStatus("connected");
      console.info("[Realtime] Socket connected");
    };

    const onDisconnect = () => {
      setConnectionStatus("disconnected");
      console.warn("[Realtime] Socket disconnected");
      addAlert({
        type: "warning",
        title: "Offline mode",
        message: "Real-time updates paused. Commands will be queued."
      });
    };

    const onReconnect = () => {
      setConnectionStatus("connected");
      console.info("[Realtime] Socket reconnected");
      void load();
      void replayQueuedCommands();
    };

    const onConnectError = (error: Error) => {
      console.error("[Realtime] Connection error:", error);
      setConnectionStatus("disconnected");
    };

    const onDeviceUpdate = (device: Device) => {
      upsertDevice(device);
      addAlert({
        type: "info",
        title: "Device update",
        message: `${device.name} is ${device.status}`
      });
    };

    // Set initial connection status
    setConnectionStatus(socket.connected ? "connected" : "connecting");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("sensor:update", onSensorUpdate);
    socket.on("device:update", onDeviceUpdate);
    socket.on("alert", onAlert);
    socket.io.on("reconnect", onReconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("sensor:update", onSensorUpdate);
      socket.off("device:update", onDeviceUpdate);
      socket.off("alert", onAlert);
      socket.io.off("reconnect", onReconnect);
      socket.off("connect_error", onConnectError);
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
      bufferedReadingsRef.current = [];
    };
  }, [
    addAlert,
    addReadingsBatch,
    load,
    upsertDevice,
    setConnectionStatus,
    replayQueuedCommands
  ]);

  /**
   * Control a device with offline queueing support.
   * If offline, queues the command for later replay.
   * If online, sends immediately.
   */
  const controlDevice = useCallback(
    async (deviceId: number, payload: DeviceControlPayload) => {
      // Update optimistic UI state
      if (payload.fanStatus) {
        setDevicePower(deviceId, "fan_status", payload.fanStatus);
      }
      if (payload.acStatus) {
        setDevicePower(deviceId, "ac_status", payload.acStatus);
      }

      const socket = getSocket();
      const isOnline = socket.connected;

      try {
        await api.post(`/devices/${deviceId}/control`, payload);
        addAlert({
          type: "info",
          title: "Device updated",
          message: "Command sent successfully"
        });
      } catch (error) {
        if (!isOnline) {
          // Queue the command for offline mode
          queueCommand(deviceId, payload);
          addAlert({
            type: "warning",
            title: "Offline mode",
            message: "Command queued. Will be sent when online."
          });
        } else {
          // Was online but request failed
          addAlert({
            type: "critical",
            title: "Control failed",
            message: "Device command was not accepted. Please try again."
          });
          load();
        }
      }
    },
    [addAlert, load, setDevicePower, queueCommand]
  );

  return {
    load,
    controlDevice
  };
}
