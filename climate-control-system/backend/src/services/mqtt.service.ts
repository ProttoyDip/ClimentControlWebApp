import mqtt from "mqtt";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { ingestSensorData } from "./sensor.service";

let mqttClient: mqtt.MqttClient | null = null;

export function startMqttClient() {
  if (!env.MQTT_ENABLED) {
    logger("info", "MQTT integration disabled by environment");
    return;
  }

  mqttClient = mqtt.connect(env.MQTT_URL, {
    username: env.MQTT_USERNAME,
    password: env.MQTT_PASSWORD
  });

  mqttClient.on("connect", () => {
    logger("info", "MQTT connected", { broker: env.MQTT_URL });
    mqttClient?.subscribe("climate/devices/+/telemetry");
  });

  mqttClient.on("message", async (_topic, payloadBuffer) => {
    try {
      const payload = JSON.parse(payloadBuffer.toString()) as {
        deviceSerial?: string;
        deviceId?: number;
        temperature: number;
        humidity: number;
        fanStatus?: "on" | "off";
        acStatus?: "on" | "off";
        recordedAt?: string;
      };

      await ingestSensorData(payload);
    } catch (error) {
      logger("error", "MQTT message processing failed", {
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  mqttClient.on("error", (error) => {
    logger("error", "MQTT error", { error: error.message });
  });
}
