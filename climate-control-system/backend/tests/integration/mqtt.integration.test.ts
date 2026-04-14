const publishMock = jest.fn();
const subscribeMock = jest.fn();
const onMock = jest.fn();

const mqttClientMock = {
  connected: true,
  on: onMock,
  subscribe: subscribeMock,
  publish: publishMock
};

const mqttConnectMock = jest.fn(() => mqttClientMock);

jest.mock("mqtt", () => ({
  connect: mqttConnectMock
}));

jest.mock("../../src/services/sensor.service", () => ({
  ingestSensorData: jest.fn()
}));

jest.mock("../../src/utils/logger", () => ({
  logger: jest.fn()
}));

describe("MQTT integration", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.MQTT_ENABLED = "true";
  });

  function loadService() {
    return {
      mqttModule: require("../../src/services/mqtt.service") as typeof import("../../src/services/mqtt.service"),
      sensorService: require("../../src/services/sensor.service") as typeof import("../../src/services/sensor.service")
    };
  }

  it("subscribes to current and legacy telemetry topics and infers serial from legacy topics", async () => {
    const { mqttModule, sensorService } = loadService();
    const ingestSensorDataMock = sensorService.ingestSensorData as jest.MockedFunction<typeof sensorService.ingestSensorData>;

    mqttModule.startMqttClient();

    const connectHandler = onMock.mock.calls.find(([eventName]) => eventName === "connect")?.[1] as (() => void) | undefined;
    const messageHandler = onMock.mock.calls.find(([eventName]) => eventName === "message")?.[1] as ((topic: string, payload: Buffer) => Promise<void>) | undefined;

    expect(connectHandler).toBeDefined();
    expect(messageHandler).toBeDefined();

    connectHandler?.();

    expect(mqttConnectMock).toHaveBeenCalledTimes(1);
    expect(subscribeMock).toHaveBeenCalledWith(["climate/sensor/data", "climate/devices/+/telemetry"]);

    await messageHandler?.(
      "climate/devices/CCS-LOBBY-001/telemetry",
      Buffer.from(
        JSON.stringify({
          temperature: 24.8,
          humidity: 56.1,
          fanStatus: "on",
          acStatus: "off"
        })
      )
    );

    expect(ingestSensorDataMock).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceSerial: "CCS-LOBBY-001",
        temperature: 24.8,
        humidity: 56.1,
        fanStatus: "on",
        acStatus: "off"
      })
    );
  });

  it("publishes control commands to both current and legacy topics", () => {
    const { mqttModule } = loadService();

    mqttModule.startMqttClient();
    mqttModule.publishDeviceControlCommand({
      deviceId: 21,
      serialNumber: "CCS-LOBBY-001",
      fanStatus: "on",
      acStatus: "off",
      requestedBy: 7
    });

    expect(publishMock).toHaveBeenCalledTimes(2);
    expect(publishMock).toHaveBeenNthCalledWith(
      1,
      "climate/device/control/CCS-LOBBY-001",
      expect.any(String),
      { qos: 1, retain: false },
      expect.any(Function)
    );
    expect(publishMock).toHaveBeenNthCalledWith(
      2,
      "climate/devices/CCS-LOBBY-001/commands",
      expect.any(String),
      { qos: 1, retain: false },
      expect.any(Function)
    );
  });
});