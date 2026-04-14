#pragma once

// Copy this file to device_config.h and fill in your own values before flashing.

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