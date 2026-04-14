# ESP32 Hardware Setup Guide

**Last Updated**: 2026-04-13  
**Target Device**: ESP32 DevKit v1 (or compatible ESP32 board)  
**Firmware**: Arduino-compatible

## Table of Contents

1. [Hardware Requirements](#hardware-requirements)
2. [Pin Configuration](#pin-configuration)
3. [Installation & Flashing](#installation--flashing)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Firmware Files

This repo keeps the ESP32 dashboard sketch and its secrets separate:

- [ClimateDeviceLocalDashboard.ino](esp32/ClimateDeviceLocalDashboard.ino) is the sketch with the LCD, time sync, and live temperature/humidity endpoints.
- [ClimateDevice.ino](esp32/ClimateDevice.ino) is the older MQTT/relay example that still uses device-side telemetry and control topics.
- [device_config.example.h](esp32/device_config.example.h) is the template for Wi-Fi and device settings.
- Copy the example file to `device_config.h` in the same folder before flashing.

---

## Hardware Requirements

### Microcontroller

| Item | Specification | Notes |
|------|---------------|-------|
| Main Board | ESP32 DevKit v1 | 38 GPIO pins, built-in WiFi + BLE |
| Alternative | ESP32-S3 | Faster, more pins, recommended for future |
| USB Cable | Micro-USB | For flashing and power during development |

### Sensors & Actuators

| Component | Part Number | Purpose | GPIO Pin | Notes |
|-----------|-------------|---------|----------|-------|
| **Temperature/Humidity** | DHT22 | Environmental sensing | GPIO 4 | Digital, requires pull-up |
| **Relay Module** | 4-Channel 5V Relay | Switch AC, Fan, Humidifier | See [GPIO Map](#gpio-pinout) | Opto-isolated recommended |
| **Power Supply** | 5V 2A USB | Power ESP32 + sensors | Via USB connector | Use quality adapter to avoid brownouts |

### Relay GPIO Mapping

```
┌─────────────────────────────────────────┐
│ ESP32 GPIO Pin Configuration            │
├─────────────────────────────────────────┤
│ GPIO 5   → Relay Channel 1 (Fan)        │
│ GPIO 16  → Relay Channel 2 (AC Unit)    │
│ GPIO 17  → Relay Channel 3 (Humidifier) │
│ GPIO 18  → Reserved for future use      │
├─────────────────────────────────────────┤
│ GPIO 4   → DHT22 Data (input)           │
│ GPIO 2   → Built-in LED (status)        │
├─────────────────────────────────────────┤
│ GND      → Common ground (all sensors)  │
│ 3.3V     → Logic level (sensor VCC)     │
│ 5V       → Relay module power           │
└─────────────────────────────────────────┘
```

### Wiring Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       ESP32 DevKit v1                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│    3V3 ─── [10kΩ pull-up] ─┐                                 │
│                            ├──── GPIO4 (DHT22 DATA)          │
│    GND ─────────────────────┘                                │
│                                                               │
│    GPIO 5  ─────────────────────→ Relay CH1 (Fan)            │
│    GPIO16  ─────────────────────→ Relay CH2 (AC)             │
│    GPIO17  ─────────────────────→ Relay CH3 (Humidifier)     │
│                                                               │
│    GND ────────────────────────→ Relay GND                   │
│    5V (via jumper) ─────────────→ Relay VCC                  │
│                                                               │
│    USB Micro ──────────────────→ Power + Serial              │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┐
│        DHT22 Sensor (back)           │
├──────────────────────────────────────┤
│ Pin 1 (Vcc)    ────→ 3.3V            │
│ Pin 2 (Data)   ────→ GPIO 4 + pull-up│
│ Pin 3 (NC)     ────→ Not connected   │
│ Pin 4 (GND)    ────→ GND             │
└──────────────────────────────────────┘
```

---

## Pin Configuration

### GPIO Definitions in Firmware

Current settings in `docs/esp32/ClimateDeviceLocalDashboard.ino`:

The relay pin mapping below applies to the older MQTT/relay example in `docs/esp32/ClimateDevice.ino`. The local dashboard sketch uses the DHT and LCD values from `device_config.h` instead.

```cpp
// Sensor
#define DHTPIN 4        // DHT22 data line
#define DHTTYPE DHT22   // Sensor type

// Relays
#define FAN_RELAY_PIN 5         // Fan control (active HIGH)
#define AC_RELAY_PIN 16         // AC unit control (active HIGH)
#define HUMIDIFIER_RELAY_PIN 17 // Humidifier control (active HIGH)
```

### Changing Pin Assignments

If your relay module uses different pins, edit [ClimateDevice.ino](../esp32/ClimateDevice.ino#L7-L12):

```cpp
#define AC_RELAY_PIN 12        // Changed from 16
```

**Important**: Verify your pins are **not** used for:
- UART0 (GPIO 1, 3) - Used for serial communication
- SPI Flash (GPIO 6-11) - Reserved
- ADC pins if you plan to add voltage sensors

[Full ESP32 pinout reference](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/hw-reference/esp32_devkitc.html)

---

## Installation & Flashing

### 1. Install Arduino IDE

**Option A: Arduino IDE 2.x (Recommended)**

```bash
# Download from https://www.arduino.cc/en/software
# Available for Windows, macOS, Linux

# Verify installation
arduino --version    # Should show 2.x.x
```

**Option B: PlatformIO (VS Code)**

```bash
# Install VS Code extension: platformio.platformio-ide
# More advanced, recommended for developers
```

### 2. Add ESP32 Board Support

In **Arduino IDE → File → Preferences**:

```
Additional Boards Manager URLs:
https://dl.espressif.com/dl/package_esp32_index.json,https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```

Then **Tools → Board → Boards Manager**:
- Search `esp32`
- Install: **esp32 by Espressif Systems** (latest v2.x)

### 3. Install Required Libraries

**Tools → Manage Libraries**:

| Library | Version | Purpose |
|---------|---------|---------|
| WiFi (built-in) | - | WiFi connectivity |
| HTTPClient (built-in) | - | REST API calls |
| PubSubClient | 2.8.0+ | MQTT client |
| ArduinoJson | 6.20.0+ | JSON parsing |
| DHT (SimpleDHT) | 1.0.0+ | Sensor reading |
| Adafruit_Sensor | 1.1.0+ | Sensor library dependency |

Install via library search. Accept all dependencies.

### 4. Download Firmware

```bash
# Clone or download the project
git clone https://github.com/your-org/climate-control-system.git
# Or https://github.com/your-org/climate-control-system/archive/main.zip

# Open firmware
# File → Open → climate-control-system/docs/esp32/ClimateDeviceLocalDashboard.ino
```

### 5. Configure Firmware

Create a local `device_config.h` next to the sketch by copying [device_config.example.h](esp32/device_config.example.h) and filling in your values.

The sketch reads these values from the config file:

```cpp
#define DEVICE_WIFI_SSID "YOUR_WIFI_SSID"
#define DEVICE_WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define DEVICE_LOCATION "Dhaka, Bangladesh"
#define DEVICE_SERIAL "ESP32-ROOM-01"
#define DEVICE_API_KEY "replace_with_backend_device_key"
#define DEVICE_API_BASE_URL "http://192.168.0.103:4000/api"
#define DEVICE_TELEMETRY_INTERVAL_MS 10000
#define DEVICE_NTP_SERVER "pool.ntp.org"
#define DEVICE_GMT_OFFSET_SEC 21600
#define DEVICE_DAYLIGHT_OFFSET_SEC 0
#define DEVICE_DHT_PIN 27
#define DEVICE_DHT_TYPE DHT22
#define DEVICE_LCD_ADDRESS 0x27
```

**Where to get these values:**

- **DEVICE_WIFI_SSID / DEVICE_WIFI_PASSWORD**: Your home or office WiFi
- **DEVICE_LOCATION**: Friendly label shown on the dashboard card
- **DEVICE_SERIAL**: Must match a device serial in your backend database
- **DEVICE_API_KEY**: Must be included in backend `DEVICE_API_KEYS`
- **DEVICE_API_BASE_URL**: Backend API base URL reachable from ESP32, usually `http://<your-pc-ip>:4000/api`
- **DEVICE_TELEMETRY_INTERVAL_MS**: Frequency for posting readings to backend, e.g. `10000`
- **DEVICE_NTP_SERVER**: Usually `pool.ntp.org`
- **DEVICE_GMT_OFFSET_SEC**: Your local UTC offset in seconds
- **DEVICE_DAYLIGHT_OFFSET_SEC**: `0` unless daylight saving applies
- **DEVICE_DHT_PIN**: GPIO connected to the DHT22 sensor
- **DEVICE_LCD_ADDRESS**: I2C address for the display, often `0x27`

Keep `device_config.h` out of version control if it contains real secrets.

### 6. Connect ESP32 via USB

1. Plug ESP32 into computer via Micro-USB
2. **Tools → Port** - should detect `/dev/ttyUSB0` or `COM3` etc
3. **Tools → Board** - select `ESP32 Dev Board` or `ESP32C3 Dev Board`
4. **Tools → Flash Frequency** - keep 80MHz
5. **Tools → Upload Speed** - 921600 (fastest)

### 7. Compile & Upload

```
Sketch → Upload (Ctrl+U)
```

Expected output:
```
Connecting........_____.....
Uploading...... 50000 (30%)
Uploading...... 100000 (60%)
..... 100%
Hard resetting via RTS pin...
```

If stuck:
- Hold **BOOT** button while uploading
- Try lower **Upload Speed** (460800)
- Check USB cable quality

### 8. Monitor Serial Output

After upload, open **Tools → Serial Monitor** (115200 baud):

```
[WIFI] Connected! IP: 192.168.1.100
Web Server Ready!
```

---

## Configuration

### WiFi Network

If WiFi fails to connect:

```cpp
// Add static IP (optional, faster connection)
IPAddress local_ip(192, 168, 1, 100);
IPAddress gateway(192, 168, 1, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress primaryDNS(8, 8, 8, 8);

WiFi.config(local_ip, gateway, subnet, primaryDNS);
```

### Sensor Calibration

DHT22 is generally accurate ±2%. If need to adjust:

```cpp
float temperature = dht.readTemperature() + 0.5;  // Add 0.5°C offset
float humidity = dht.readHumidity() - 2.0;         // Subtract 2% offset
```

### MQTT Topics

This section applies to the MQTT-based relay sketch in `docs/esp32/ClimateDevice.ino`.

By default, the device:
- **Subscribes to**: `climate/device/control/{DEVICE_SERIAL}` for AC/Fan commands
- **Publishes to**: `climate/sensor/data` with sensor readings

Change in firmware (optional):

```cpp
const char *MQTT_CONTROL_TOPIC_PREFIX = "myapp/devices";  // Custom prefix
```

### Telemetry Frequency

Default: sends every 10 seconds

```cpp
const unsigned long SEND_INTERVAL_MS = 10000;  // Change to 5000 for 5-sec interval
```

---

## Testing

### Test 1: WiFi Connection

**Expected**: Device connects to WiFi within 10 seconds

```
Serial output:
[WIFI] Connecting to 'MyNetwork'...
[WIFI] Connected! IP: 192.168.1.100
```

### Test 2: Sensor Reading

**Expected**: Temperature and humidity readings every 10 seconds

```
Serial output:
[DHT22] Temperature: 22.5°C, Humidity: 45%
[TELEMETRY] Sending data...
[HTTP] POST /sensors/data → 202 Accepted
```

Check backend:
```bash
curl http://localhost:4000/api/sensors/latest?limit=1
# Should show recent reading from ESP32-ROOM-01
```

### Test 3: Relay Control via MQTT

**Send command from backend:**

```bash
# Publish command to turn on AC
mosquitto_pub -h localhost -t "climate/device/control/ESP32-ROOM-01" \
  -m '{"acStatus":"on","fanStatus":"off"}'
```

**Expected on ESP32**:
- Serial output: `[RELAY] AC turned ON`
- GPIO 16 should have ~5V (active HIGH)
- AC relay should click (audible)

**Test with multimeter** (optional):
- GPIO 5 (Fan): Should read ~3.3V when on, 0V when off
- GPIO 16 (AC): Same as above
- GPIO 17 (Humidifier): Same as above

### Test 4: API Ingestion

**Dashboard should show**:
1. Device appears in device list
2. Temperature/humidity bars updating
3. No error alerts

**Backend logs**:
```bash
docker logs climate-backend | grep "ESP32-ROOM-01"
# Should see: Sensor data accepted from ESP32-ROOM-01
```

---

## Troubleshooting

### Issue: "Failed to download board package"

**Solution**: Check internet, try different network:
```
Tools → Boards Manager → refresh button
```

### Issue: "Serial port not found"

**Solution**:
- Check USB cable is data cable (not charging only)
- Install CH340 drivers: https://www.wemos.cc/downloads
- Restart Arduino IDE
- Try different USB port

### Issue: "Upload timeout" or "Hard resetting via RTS pin..."

**Solution**:
- Hold BOOT button while uploading
- Reduce Upload Speed to 460800
- Replace USB cable
- Use different USB port

### Issue: "MQTT connection refused"

**Check server**:
```bash
nc -zv mqtt.server 1883    # Should return "success"
mosquitto_sub -h mqtt.server -t '$SYS/#'  # Should show output
```

**Check credentials**:
```cpp
// Verify in firmware
const char *MQTT_USER = "mqtt-user";     // Case-sensitive!
const char *MQTT_PASS = "mqtt-pass";     // WrongPassword ≠ wrongpassword
```

### Issue: "DHT22 read failed"

**Solutions**:
- Check sensor wiring (pin 1=VCC, 2=DATA, 4=GND)
- Verify pull-up resistor is 10kΩ (4.7kΩ-12kΩ acceptable)
- Remove any long, unshielded wires (keep data line < 2 meters)
- Reduce telemetry frequency (DHT22 has 2-second read limit)

### Issue: "WiFi connected but no data sent"

**Check:**
```bash
# Can backend reach ESP32?
ping <esp32-ip>       # Should respond

# Does firewall block port 4000?
nc -zv backend-host 4000   # Should return "success"

# Check API key
# DEVICE_API_KEY in firmware must match one in backend .env
echo $DEVICE_API_KEYS | grep "your-device-key"
```

### Issue: Relay doesn't click / GPIO not responding

**Test GPIO with LED** (temporary):
```cpp
// Replace relay test:
digitalWrite(FAN_RELAY_PIN, HIGH);   // Turn on (should light LED)
delay(1000);
digitalWrite(FAN_RELAY_PIN, LOW);    // Turn off
```

**Check GPIO pin conflicts**:
- GPIO 1, 3 - UART (serial communication)
- GPIO 6-11 - SPI Flash
- GPIO 21, 22, 23 - I2C default (change if using I2C)

---

## Advanced: OTA Firmware Updates

To enable wireless updates without USB:

```cpp
#include <ArduinoOTA.h>

void setup() {
  // ... existing setup code ...
  
  ArduinoOTA.onStart([]() {
    String type = (ArduinoOTA.getCommand() == U_FLASH) ? "sketch" : "filesystem";
    Serial.println("[OTA] Start updating " + type);
  });
  
  ArduinoOTA.onEnd([]() {
    Serial.println("\n[OTA] End");
  });
  
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("[OTA] Error[%u]: ", error);
  });
  
  ArduinoOTA.begin();
}

void loop() {
  ArduinoOTA.handle();
  // ... rest of loop ...
}
```

Then upload from: **Sketch → Upload → Network Ports**

---

## Support & Resources

- **Arduino IDE Help**: https://www.arduino.cc/reference/en/
- **ESP32 Documentation**: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/
- **DHT22 Datasheet**: https://www.adafruit.com/datasheets/DHT22.pdf
- **PubSubClient Docs**: https://pubsubclient.knolleary.net/
- **GitHub Issues**: Report bugs with Serial output attached

---

**Last updated**: 2026-04-13  
**Maintained by**: Hardware Team
