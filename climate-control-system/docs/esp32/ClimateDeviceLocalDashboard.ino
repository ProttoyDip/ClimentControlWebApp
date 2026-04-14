#include "WiFi.h"
#include <ESPAsyncWebServer.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <HTTPClient.h>
#include "time.h"
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#include "device_config.h"

// --- Configuration ---
const char* ssid = DEVICE_WIFI_SSID;
const char* password = DEVICE_WIFI_PASSWORD;
const char* myLocation = DEVICE_LOCATION;
const char* deviceSerial = DEVICE_SERIAL;
const char* deviceApiKey = DEVICE_API_KEY;
const char* apiBaseUrl = DEVICE_API_BASE_URL;

const char* ntpServer = DEVICE_NTP_SERVER;
const long  gmtOffset_sec = DEVICE_GMT_OFFSET_SEC;
const int   daylightOffset_sec = DEVICE_DAYLIGHT_OFFSET_SEC;
const unsigned long telemetryIntervalMs = DEVICE_TELEMETRY_INTERVAL_MS;

#define DHTPIN DEVICE_DHT_PIN
#define DHTTYPE DEVICE_DHT_TYPE

// --- LCD Settings ---
LiquidCrystal_I2C lcd(DEVICE_LCD_ADDRESS, 16, 2);

DHT dht(DHTPIN, DHTTYPE);
AsyncWebServer server(80);

void sendTelemetryToBackend(float temperature, float humidity) {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  HTTPClient http;
  String endpoint = String(apiBaseUrl) + "/sensors/data";
  String payload = String("{\"deviceSerial\":\"") + deviceSerial +
                   "\",\"temperature\":" + String(temperature, 2) +
                   ",\"humidity\":" + String(humidity, 2) + "}";

  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", deviceApiKey);

  int code = http.POST(payload);
  if (code < 200 || code >= 300) {
    Serial.printf("Telemetry POST failed: %d\n", code);
  }
  http.end();
}

String getLocalTimeStr() {
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){ return "Syncing..."; }
  char buf[50];
  strftime(buf, sizeof(buf), "%H:%M:%S", &timeinfo);
  return String(buf);
}

const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE HTML><html>
<head>
  <title>Dhaka IoT Station</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css">
  <style>
    html { font-family: Arial; display: inline-block; margin: 0px auto; text-align: center; background-color: #f4f7f6; color: #333; }
    .card { background: white; padding: 30px; margin: 50px auto; border-radius: 15px; width: 85%; max-width: 400px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .time { font-size: 2.5rem; font-weight: bold; margin: 10px 0; }
    .location { color: #888; text-transform: uppercase; font-size: 0.9rem; }
    .data { font-size: 2rem; margin: 20px 0; font-weight: bold; }
    footer { margin-top: 50px; font-size: 0.8rem; }
    footer a { color: #ff0000; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <div class="location"><i class="fas fa-map-marker-alt"></i> {{LOCATION}}</div>
    <div class="time" id="clock">00:00:00</div>
    <hr style="border:0; border-top:1px solid #eee;">
    <div class="data" style="color:#059e8a;">
      <i class="fas fa-thermometer-half"></i> <span id="temp">--</span>&deg;C
    </div>
    <div class="data" style="color:#00add6;">
      <i class="fas fa-tint"></i> <span id="hum">--</span>%
    </div>
  </div>
  <script>
    function updateData() {
      fetch('/time').then(r => r.text()).then(d => { document.getElementById("clock").innerHTML = d; });
      fetch('/temp').then(r => r.text()).then(d => { document.getElementById("temp").innerHTML = d; });
      fetch('/hum').then(r => r.text()).then(d => { document.getElementById("hum").innerHTML = d; });
    }
    setInterval(updateData, 2000);
    updateData();
  </script>
</body>
</html>)rawliteral";

String renderIndexHtml() {
  String html = FPSTR(index_html);
  html.replace("{{LOCATION}}", myLocation);
  return html;
}

// ===== LCD UPDATE =====
void updateLCD() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  lcd.clear();

  // Line 1: Time
  lcd.setCursor(0, 0);
  lcd.print(getLocalTimeStr());

  // Line 2: Temp + Hum
  lcd.setCursor(0, 1);

  if (isnan(t) || isnan(h)) {
    lcd.print("Sensor Error");
    Serial.println("DHT read failed!");
    return;
  }

  lcd.print("T:");
  lcd.print(t, 1);
  lcd.print("C ");

  lcd.print("H:");
  lcd.print(h, 0);
  lcd.print("%");
}


// ===== SETUP =====
void setup(){
  Serial.begin(115200);
  dht.begin();

  Wire.begin();  // default pins (21 SDA, 22 SCL)

  // LCD init
  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected!");
  Serial.println(WiFi.localIP());

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Connected");

  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200, "text/html", renderIndexHtml());
  });

  server.on("/temp", HTTP_GET, [](AsyncWebServerRequest *request){
    float t = dht.readTemperature();
    request->send(200, "text/plain", isnan(t) ? "--" : String(t, 1));
  });

  server.on("/hum", HTTP_GET, [](AsyncWebServerRequest *request){
    float h = dht.readHumidity();
    request->send(200, "text/plain", isnan(h) ? "--" : String(h, 0));
  });

  server.on("/time", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200, "text/plain", getLocalTimeStr());
  });

  server.begin();
  Serial.println("Web Server Ready!");
}


// ===== LOOP =====
void loop(){
  static unsigned long lastUpdate = 0;
  static unsigned long lastTelemetry = 0;

  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (millis() - lastUpdate > 2000) {
    updateLCD();
    lastUpdate = millis();
  }

  if (!isnan(t) && !isnan(h) && millis() - lastTelemetry > telemetryIntervalMs) {
    sendTelemetryToBackend(t, h);
    lastTelemetry = millis();
  }
}