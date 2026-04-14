import mqtt from "mqtt";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { ingestSensorData } from "./sensor.service";

let mqttClient: mqtt.MqttClient | null = null;

function extractLegacyTelemetrySerial(topic: string) {
  const match = topic.match(/^climate\/devices\/([^/]+)\/telemetry$/);
  return match?.[1];
}

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

  mqttClient.on("message", async (topic, payloadBuffer) => {
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

      if (!payload.deviceSerial) {
        const legacySerial = extractLegacyTelemetrySerial(topic);
        if (legacySerial) {
          payload.deviceSerial = legacySerial;
        }
      }

      await ingestSensorData(payload);
    } catch (error) {
      logger("error", "MQTT message processing failed", {
        topic,
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
  const legacyTopic = `climate/devices/${payload.serialNumber}/commands`;
  const payloadBody = JSON.stringify(payload);

  for (const currentTopic of [topic, legacyTopic]) {
    mqttClient.publish(currentTopic, payloadBody, { qos: 1, retain: false }, (error) => {
      if (error) {
        logger("error", "Failed to publish device control command", {
          topic: currentTopic,
          error: error.message
        });
        return;
      }

      logger("info", "Published device control command", {
        topic: currentTopic,
        deviceId: payload.deviceId
      });
    });
  }
}
