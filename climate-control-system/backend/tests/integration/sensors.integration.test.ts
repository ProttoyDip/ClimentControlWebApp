import request from "supertest";
import { createApp } from "../../src/app";
import * as alertModel from "../../src/models/alert.model";
import * as deviceModel from "../../src/models/device.model";
import * as sensorDataModel from "../../src/models/sensorData.model";
import * as realtimeService from "../../src/services/realtime.service";
import { createAccessToken } from "../helpers/auth";

jest.mock("../../src/models/device.model", () => ({
  findDeviceById: jest.fn(),
  findDeviceBySerial: jest.fn(),
  updateDeviceState: jest.fn()
}));

jest.mock("../../src/models/sensorData.model", () => ({
  insertSensorReading: jest.fn(),
  getLatestReadings: jest.fn(),
  getReadingsByDevice: jest.fn(),
  getReadingsSince: jest.fn()
}));

jest.mock("../../src/models/log.model", () => ({
  createLog: jest.fn()
}));

jest.mock("../../src/models/alert.model", () => ({
  createAlert: jest.fn()
}));

jest.mock("../../src/services/realtime.service", () => ({
  emitSensorUpdate: jest.fn(),
  emitAlert: jest.fn(),
  emitDeviceStatus: jest.fn()
}));

const findDeviceBySerialMock = deviceModel.findDeviceBySerial as unknown as jest.Mock;
const updateDeviceStateMock = deviceModel.updateDeviceState as unknown as jest.Mock;
const insertSensorReadingMock = sensorDataModel.insertSensorReading as unknown as jest.Mock;
const getLatestReadingsMock = sensorDataModel.getLatestReadings as unknown as jest.Mock;
const getReadingsByDeviceMock = sensorDataModel.getReadingsByDevice as unknown as jest.Mock;
const getReadingsSinceMock = sensorDataModel.getReadingsSince as unknown as jest.Mock;
const createAlertMock = alertModel.createAlert as unknown as jest.Mock;
const emitAlertMock = realtimeService.emitAlert as unknown as jest.Mock;

describe("Sensor integration", () => {
  const app = createApp();
  const token = createAccessToken({ role: "admin" });

  beforeEach(() => {
    jest.clearAllMocks();
    getReadingsSinceMock.mockResolvedValue([]);
  });

  it("ingests sensor data and emits threshold alerts", async () => {
    findDeviceBySerialMock.mockResolvedValueOnce({
      id: 11,
      user_id: 1,
      name: "Main Controller",
      serial_number: "CCS-LOBBY-001",
      device_type: "ac",
      status: "online",
      power_status: "on",
      fan_status: "on",
      ac_status: "on",
      settings_json: "{}",
      settings: {}
    });

    insertSensorReadingMock.mockResolvedValueOnce(2001);

    const response = await request(app).post("/api/sensors/data").send({
      deviceSerial: "CCS-LOBBY-001",
      temperature: 31.6,
      humidity: 30.2,
      fanStatus: "on",
      acStatus: "on"
    }).set("x-device-key", "replace_me_device_key_1");

    expect(response.status).toBe(202);
    expect(response.body.data).toEqual({ readingId: 2001, deviceId: 11 });
    expect(updateDeviceStateMock).toHaveBeenCalled();
    expect(createAlertMock).toHaveBeenCalledTimes(2);
    expect(emitAlertMock).toHaveBeenCalledTimes(2);
  });

  it("returns latest readings for authenticated user", async () => {
    getLatestReadingsMock.mockResolvedValueOnce([
      {
        id: 1,
        device_id: 11,
        temperature: 25.2,
        humidity: 50.1,
        fan_status: "on",
        ac_status: "off",
        recorded_at: "2026-04-07T10:00:00.000Z"
      }
    ]);

    const response = await request(app)
      .get("/api/sensors/latest")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it("returns last ingest status for device serial", async () => {
    findDeviceBySerialMock.mockResolvedValueOnce({
      id: 11,
      user_id: 1,
      name: "Main Controller",
      serial_number: "CCS-LOBBY-001",
      device_type: "ac",
      status: "online",
      power_status: "on",
      fan_status: "on",
      ac_status: "on",
      settings_json: "{}",
      settings: {}
    });

    getReadingsByDeviceMock.mockResolvedValueOnce([
      {
        id: 1,
        device_id: 11,
        temperature: 28.4,
        humidity: 63.2,
        fan_status: "on",
        ac_status: "off",
        recorded_at: new Date(Date.now() - 15000).toISOString()
      }
    ]);

    const response = await request(app)
      .get("/api/sensors/status/CCS-LOBBY-001")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        deviceId: 11,
        deviceSerial: "CCS-LOBBY-001",
        hasIngest: true,
        lastIngest: expect.objectContaining({
          temperature: 28.4,
          humidity: 63.2,
          fanStatus: "on",
          acStatus: "off"
        })
      })
    );
    expect(typeof response.body.data.secondsSinceLastIngest).toBe("number");
  });
});
