#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "DHT.h"

// ============ CONFIGURATION ============
#define DHTPIN 4
#define DHTTYPE DHT22

// GPIO Relay Pin Mappings (Configure based on your hardware)
#define FAN_RELAY_PIN 5        // GPIO5 - Fan control
#define AC_RELAY_PIN 16        // GPIO16 - AC control
#define HUMIDIFIER_RELAY_PIN 17 // GPIO17 - Humidifier control

// WiFi & Device Configuration
const char *WIFI_SSID = "YOUR_WIFI_SSID";
const char *WIFI_PASS = "YOUR_WIFI_PASSWORD";

const char *DEVICE_SERIAL = "ESP32-ROOM-01";
const char *DEVICE_API_KEY = "replace-with-x-device-key";

// Backend & MQTT Configuration
const char *API_BASE_URL = "http://your-backend-host:4000/api";
const char *MQTT_HOST = "your-mqtt-host";
const int MQTT_PORT = 1883;
const char *MQTT_USER = "mqtt-user";
const char *MQTT_PASS = "mqtt-pass";

const char *MQTT_SENSOR_TOPIC = "climate/sensor/data";
const char *MQTT_CONTROL_TOPIC_PREFIX = "climate/device/control";

const unsigned long SEND_INTERVAL_MS = 10000;
const unsigned long RELAY_PULSE_DURATION_MS = 50; // Relay control pulse width

DHT dht(DHTPIN, DHTTYPE);
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

unsigned long lastSendMs = 0;
bool fanOn = false;
bool acOn = false;

String controlTopic() {
  return String(MQTT_CONTROL_TOPIC_PREFIX) + "/" + DEVICE_SERIAL;
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void activateRelay(int relayPin, bool isOn) {
  /**
   * Activates or deactivates a relay connected to the specified GPIO pin.
   * Set pin to HIGH to turn relay ON (energize), LOW to turn OFF (de-energize).
   * 
   * NOTE: Relay logic depends on your relay module:
   * - Active HIGH relay: HIGH = ON, LOW = OFF (standard)
   * - Active LOW relay: HIGH = OFF, LOW = ON (inverted)
   * 
   * Adjust the logic below if using active-low relays.
   */
  digitalWrite(relayPin, isOn ? HIGH : LOW);
  Serial.printf("Relay pin %d set to %s\n", relayPin, isOn ? "ON" : "OFF");
}

void mqttCallback(char *topic, byte *payload, unsigned int length) {
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, payload, length);
  if (err) {
    Serial.println("MQTT JSON parse error");
    return;
  }

  // Parse fan control status
  if (doc["fanStatus"].is<const char *>()) {
    fanOn = String(doc["fanStatus"].as<const char *>()) == "on";
    activateRelay(FAN_RELAY_PIN, fanOn);
  }
  
  // Parse AC control status
  if (doc["acStatus"].is<const char *>()) {
    acOn = String(doc["acStatus"].as<const char *>()) == "on";
    activateRelay(AC_RELAY_PIN, acOn);
  }

  Serial.printf("Control received topic=%s fan=%s ac=%s\n", topic, fanOn ? "on" : "off", acOn ? "on" : "off");
}

void connectMqtt() {
  if (mqttClient.connected()) return;

  while (!mqttClient.connected()) {
    if (mqttClient.connect(DEVICE_SERIAL, MQTT_USER, MQTT_PASS)) {
      mqttClient.subscribe(controlTopic().c_str(), 1);
    } else {
      delay(2000);
    }
  }
}

void sendTelemetryHTTP(float temperature, float humidity) {
  HTTPClient http;
  String endpoint = String(API_BASE_URL) + "/sensors/data";

  StaticJsonDocument<256> doc;
  doc["deviceSerial"] = DEVICE_SERIAL;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["fanStatus"] = fanOn ? "on" : "off";
  doc["acStatus"] = acOn ? "on" : "off";

  String body;
  serializeJson(doc, body);

  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", DEVICE_API_KEY);

  int code = http.POST(body);
  Serial.printf("HTTP ingest status=%d\n", code);
  http.end();
}

void sendTelemetryMQTT(float temperature, float humidity) {
  StaticJsonDocument<256> doc;
  doc["deviceSerial"] = DEVICE_SERIAL;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["fanStatus"] = fanOn ? "on" : "off";
  doc["acStatus"] = acOn ? "on" : "off";

  char buffer[256];
  size_t len = serializeJson(doc, buffer);
  mqttClient.publish(MQTT_SENSOR_TOPIC, buffer, len, false);
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  // Initialize relay pins as outputs
  pinMode(FAN_RELAY_PIN, OUTPUT);
  pinMode(AC_RELAY_PIN, OUTPUT);
  pinMode(HUMIDIFIER_RELAY_PIN, OUTPUT);
  
  // Set all relays to OFF (LOW) initially
  digitalWrite(FAN_RELAY_PIN, LOW);
  digitalWrite(AC_RELAY_PIN, LOW);
  digitalWrite(HUMIDIFIER_RELAY_PIN, LOW);
  
  Serial.println("GPIO relays initialized (all OFF)");

  connectWiFi();
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
}

void loop() {
  connectWiFi();
  connectMqtt();
  mqttClient.loop();

  unsigned long now = millis();
  if (now - lastSendMs < SEND_INTERVAL_MS) return;
  lastSendMs = now;

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("DHT read failed");
    return;
  }

  sendTelemetryHTTP(temperature, humidity);
  sendTelemetryMQTT(temperature, humidity);
}
