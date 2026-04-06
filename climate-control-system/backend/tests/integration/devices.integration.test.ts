import request from "supertest";
import { createApp } from "../../src/app";
import * as deviceModel from "../../src/models/device.model";
import * as logModel from "../../src/models/log.model";
import * as realtimeService from "../../src/services/realtime.service";
import { createAccessToken } from "../helpers/auth";

jest.mock("../../src/models/device.model", () => ({
  listDevices: jest.fn(),
  createDevice: jest.fn(),
  findDeviceById: jest.fn(),
  findDeviceBySerial: jest.fn(),
  updateDeviceState: jest.fn()
}));

jest.mock("../../src/models/log.model", () => ({
  createLog: jest.fn()
}));

jest.mock("../../src/services/realtime.service", () => ({
  emitDeviceStatus: jest.fn(),
  emitSensorUpdate: jest.fn(),
  emitAlert: jest.fn()
}));

const listDevicesMock = deviceModel.listDevices as jest.MockedFunction<typeof deviceModel.listDevices>;
const createDeviceMock = deviceModel.createDevice as jest.MockedFunction<typeof deviceModel.createDevice>;
const findDeviceByIdMock = deviceModel.findDeviceById as jest.MockedFunction<typeof deviceModel.findDeviceById>;
const updateDeviceStateMock = deviceModel.updateDeviceState as jest.MockedFunction<typeof deviceModel.updateDeviceState>;
const emitDeviceStatusMock = realtimeService.emitDeviceStatus as jest.MockedFunction<typeof realtimeService.emitDeviceStatus>;

describe("Device integration", () => {
  const app = createApp();
  const adminToken = createAccessToken({ id: 1, role: "admin" });
  const userToken = createAccessToken({ id: 2, role: "user" });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns devices for authenticated user", async () => {
    listDevicesMock.mockResolvedValueOnce([
      {
        id: 21,
        user_id: 1,
        name: "Lobby AC",
        serial_number: "CCS-LOBBY-001",
        device_type: "ac",
        status: "online",
        power_status: "on",
        fan_status: "on",
        ac_status: "on",
        settings_json: "{}",
        settings: {}
      }
    ]);

    const response = await request(app).get("/api/devices").set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it("creates a device for admin", async () => {
    createDeviceMock.mockResolvedValueOnce(31);
    findDeviceByIdMock.mockResolvedValueOnce({
      id: 31,
      user_id: 1,
      name: "Server Fan",
      serial_number: "FAN-001",
      device_type: "fan",
      status: "online",
      power_status: "off",
      fan_status: "off",
      ac_status: "off",
      settings_json: "{}",
      settings: {}
    });

    const response = await request(app)
      .post("/api/devices")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Server Fan",
        serialNumber: "FAN-001",
        type: "fan",
        status: "off",
        settings: { fanSpeed: 3 }
      });

    expect(response.status).toBe(201);
    expect(response.body.data.id).toBe(31);
    expect(emitDeviceStatusMock).toHaveBeenCalledTimes(1);
  });

  it("toggles a device power state", async () => {
    findDeviceByIdMock
      .mockResolvedValueOnce({
        id: 21,
        user_id: 1,
        name: "Lobby AC",
        serial_number: "CCS-LOBBY-001",
        device_type: "ac",
        status: "online",
        power_status: "off",
        fan_status: "off",
        ac_status: "off",
        settings_json: "{}",
        settings: {}
      })
      .mockResolvedValueOnce({
        id: 21,
        user_id: 1,
        name: "Lobby AC",
        serial_number: "CCS-LOBBY-001",
        device_type: "ac",
        status: "online",
        power_status: "on",
        fan_status: "off",
        ac_status: "off",
        settings_json: "{}",
        settings: {}
      });

    const response = await request(app)
      .patch("/api/devices/21/toggle")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(updateDeviceStateMock).toHaveBeenCalledWith(21, expect.objectContaining({ power_status: "on" }));
  });

  it("updates device settings", async () => {
    findDeviceByIdMock
      .mockResolvedValueOnce({
        id: 21,
        user_id: 1,
        name: "Lobby AC",
        serial_number: "CCS-LOBBY-001",
        device_type: "ac",
        status: "online",
        power_status: "on",
        fan_status: "on",
        ac_status: "on",
        settings_json: '{"mode":"cool"}',
        settings: { mode: "cool" }
      })
      .mockResolvedValueOnce({
        id: 21,
        user_id: 1,
        name: "Lobby AC",
        serial_number: "CCS-LOBBY-001",
        device_type: "ac",
        status: "online",
        power_status: "on",
        fan_status: "on",
        ac_status: "on",
        settings_json: '{"mode":"eco"}',
        settings: { mode: "eco" }
      });

    const response = await request(app)
      .patch("/api/devices/21/settings")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ settings: { mode: "eco" } });

    expect(response.status).toBe(200);
    expect(updateDeviceStateMock).toHaveBeenCalledWith(
      21,
      expect.objectContaining({ settings_json: JSON.stringify({ mode: "eco" }) })
    );
  });
});
