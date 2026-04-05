# MQTT Topic Guide

## Topic Namespace

- Telemetry publish from devices:
  climate/devices/{serial}/telemetry

- Control command publish from backend:
  climate/devices/{serial}/commands

- Device heartbeat:
  climate/devices/{serial}/heartbeat

## Example Telemetry Payload

{
  "deviceSerial": "CCS-LOBBY-001",
  "temperature": 24.8,
  "humidity": 56.1,
  "fanStatus": "on",
  "acStatus": "off",
  "recordedAt": "2026-04-06T09:20:00.000Z"
}

## Recommendations

- Use retained heartbeat messages with short TTL.
- Include message timestamp from device clock.
- Add message signing or TLS client certs for production broker.
