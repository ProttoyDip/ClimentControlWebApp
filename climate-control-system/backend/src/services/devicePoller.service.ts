import { env } from "../config/env";
import { logger } from "../utils/logger";
import { ingestSensorData } from "./sensor.service";

function parseSensorValue(raw: string) {
  const value = Number.parseFloat(raw.trim());
  return Number.isFinite(value) ? value : null;
}

async function fetchEndpointValue(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  const text = await response.text();
  const value = parseSensorValue(text);
  if (value === null) {
    throw new Error(`Invalid numeric value from ${url}: ${text}`);
  }

  return value;
}

export function startDevicePoller() {
  if (!env.DEVICE_POLLER_ENABLED) {
    logger("info", "Device poller disabled by environment");
    return;
  }

  const baseUrl = env.DEVICE_POLLER_BASE_URL.replace(/\/+$/, "");
  const deviceSerial = env.DEVICE_POLLER_DEVICE_SERIAL.trim();

  if (!baseUrl || !deviceSerial) {
    logger("warn", "Device poller enabled but configuration is incomplete", {
      hasBaseUrl: Boolean(baseUrl),
      hasDeviceSerial: Boolean(deviceSerial)
    });
    return;
  }

  logger("info", "Device poller started", {
    baseUrl,
    deviceSerial,
    intervalMs: env.DEVICE_POLLER_INTERVAL_MS
  });

  let inFlight = false;

  const poll = async () => {
    if (inFlight) {
      return;
    }

    inFlight = true;
    try {
      const [temperature, humidity] = await Promise.all([
        fetchEndpointValue(`${baseUrl}/temp`),
        fetchEndpointValue(`${baseUrl}/hum`)
      ]);

      await ingestSensorData({
        deviceSerial,
        temperature,
        humidity,
        fanStatus: env.DEVICE_POLLER_FAN_STATUS,
        acStatus: env.DEVICE_POLLER_AC_STATUS
      });
    } catch (error) {
      logger("warn", "Device poller cycle failed", {
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      inFlight = false;
    }
  };

  void poll();
  setInterval(() => {
    void poll();
  }, env.DEVICE_POLLER_INTERVAL_MS);
}