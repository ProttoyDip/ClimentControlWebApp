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
    mqttClient?.subscribe([env.MQTT_SENSOR_TOPIC, "climate/devices/+/telemetry"]);
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

export function publishDeviceControlCommand(payload: {
  deviceId: number;
  serialNumber: string;
  fanStatus: "on" | "off";
  acStatus: "on" | "off";
  requestedBy: number;
}) {
  if (!mqttClient || !mqttClient.connected) {
    logger("warn", "MQTT publish skipped because client is disconnected", {
      serialNumber: payload.serialNumber
    });
    return;
  }

  const topic = `${env.MQTT_DEVICE_CONTROL_TOPIC_PREFIX}/${payload.serialNumber}`;
  mqttClient.publish(topic, JSON.stringify(payload), { qos: 1, retain: false }, (error) => {
    if (error) {
      logger("error", "Failed to publish device control command", {
        topic,
        error: error.message
      });
      return;
    }

    logger("info", "Published device control command", {
      topic,
      deviceId: payload.deviceId
    });
  });
}
