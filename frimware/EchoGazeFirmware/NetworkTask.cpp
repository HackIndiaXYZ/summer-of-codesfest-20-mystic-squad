#include "NetworkTask.h"
#include "Config.h"
#include "Feedback.h"
#include <WiFi.h>
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <DNSServer.h>
#include <Update.h>

// Port 80 for HTTP, port 81 for WebSocket
static WebServer server(80);
static WebSocketsServer webSocket(81);
static DNSServer dnsServer;

static void broadcastWebSocket(const String& message) {
    webSocket.broadcastTXT(message.c_str());
}

static void handleWebSocketMessage(uint8_t *payload, size_t length) {
    StaticJsonDocument<256> doc;
    if (deserializeJson(doc, payload, length) == DeserializationError::Ok) {
        String cmd = doc["cmd"];
        if (cmd == "set_threshold") {
            currentBlinkThreshold = doc["value"];
        } else if (cmd == "set_debounce") {
            currentDebounceMs = doc["value"];
        } else if (cmd == "set_scan_speed") {
            currentDoubleBlinkWindowMs = doc["value"];
        }
    }
}

static void onWsEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length) {
    switch (type) {
        case WStype_TEXT: {
            handleWebSocketMessage(payload, length);
            break;
        }
        case WStype_DISCONNECTED:
            Serial.printf("WS Client #%u disconnected\n", num);
            break;
        case WStype_CONNECTED:
            Serial.printf("WS Client #%u connected\n", num);
            break;
        default:
            break;
    }
}

// Helper to serve SPIFFS files with correct MIME type
static String getMimeType(const String& path) {
    if (path.endsWith(".html")) return "text/html";
    if (path.endsWith(".css"))  return "text/css";
    if (path.endsWith(".js"))   return "application/javascript";
    if (path.endsWith(".json")) return "application/json";
    if (path.endsWith(".png"))  return "image/png";
    if (path.endsWith(".jpg"))  return "image/jpeg";
    if (path.endsWith(".ico"))  return "image/x-icon";
    if (path.endsWith(".svg"))  return "image/svg+xml";
    return "text/plain";
}

static bool serveFile(String path) {
    if (path.endsWith("/")) path += "index.html";
    if (SPIFFS.exists(path)) {
        File file = SPIFFS.open(path, "r");
        server.streamFile(file, getMimeType(path));
        file.close();
        return true;
    }
    return false;
}

void setupNetworkTask() {
    if (!SPIFFS.begin(true)) {
        Serial.println("SPIFFS Mount Failed - formatting");
    }

    WiFi.mode(WIFI_AP_STA);
    String mac = WiFi.macAddress();
    mac.replace(":", "");
    String apSsid = AP_SSID_PREFIX + mac.substring(mac.length() - 4);

    WiFi.softAP(apSsid.c_str(), AP_DEFAULT_PASSWORD);
    dnsServer.start(53, "*", WiFi.softAPIP());

    Preferences prefs;
    prefs.begin("echogaze", true);
    String sta_ssid = prefs.getString("ssid", "");
    String sta_pass = prefs.getString("pass", "");
    prefs.end();

    if (sta_ssid.length() > 0) {
        WiFi.begin(sta_ssid.c_str(), sta_pass.c_str());
        Serial.println("Connecting to STA: " + sta_ssid);
    }

    // WebSocket on port 81
    webSocket.begin();
    webSocket.onEvent(onWsEvent);

    // Serve static files from SPIFFS
    server.onNotFound([]() {
        String uri = server.uri();
        if (!serveFile(uri)) {
            // Captive portal redirect for unknown paths
            server.sendHeader("Location", "http://" + WiFi.softAPIP().toString() + "/");
            server.send(302, "text/plain", "Redirecting...");
        }
    });

    // WiFi credential endpoint
    server.on("/wifi", HTTP_POST, []() {
        String ssid = server.hasArg("ssid") ? server.arg("ssid") : "";
        String pass = server.hasArg("pass") ? server.arg("pass") : "";

        if (ssid.length() > 0) {
            Preferences p;
            p.begin("echogaze", false);
            p.putString("ssid", ssid);
            p.putString("pass", pass);
            p.end();
            server.send(200, "text/plain", "Credentials saved. Rebooting...");
            delay(1000);
            ESP.restart();
        } else {
            server.send(400, "text/plain", "SSID required");
        }
    });

    // OTA firmware update endpoint
    server.on("/update", HTTP_POST, []() {
        bool ok = !Update.hasError();
        server.send(200, "text/plain", ok ? "OK" : "FAIL");
        if (ok) {
            delay(1000);
            ESP.restart();
        }
    }, []() {
        HTTPUpload& upload = server.upload();
        if (upload.status == UPLOAD_FILE_START) {
            Update.begin(UPDATE_SIZE_UNKNOWN);
        } else if (upload.status == UPLOAD_FILE_WRITE) {
            Update.write(upload.buf, upload.currentSize);
        } else if (upload.status == UPLOAD_FILE_END) {
            Update.end(true);
        }
    });

    server.begin();
    xTaskCreatePinnedToCore(networkTask, "Network Task", 8192, NULL, 1, NULL, 0);
}

void networkTask(void *pvParameters) {
    unsigned long lastStatusTime = 0;

    for (;;) {
        unsigned long now = millis();

        // These must be called in the loop for synchronous server
        dnsServer.processNextRequest();
        server.handleClient();
        webSocket.loop();

        // LED indicates WiFi status at a glance
        if (WiFi.status() == WL_CONNECTED) {
            setStatusLed(true);
        } else {
            blinkStatusLed(500);
        }

        // Broadcast device status every 5 seconds
        if (now - lastStatusTime >= 5000) {
            lastStatusTime = now;
            int rssi = WiFi.RSSI();
            StaticJsonDocument<128> doc;
            doc["type"] = "status";
            doc["uptime"] = now / 1000;
            doc["battery"] = 100;
            doc["rssi"] = rssi;
            String status;
            serializeJson(doc, status);
            broadcastWebSocket(status);
        }

        // Forward sensor events to WebSocket clients
        EventType ev;
        if (xQueueReceive(wsEventQueue, &ev, 0) == pdPASS) {
            if (ev == EVT_SINGLE_CLICK || ev == EVT_SINGLE_BLINK) {
                broadcastWebSocket("{\"type\":\"single_click\"}");
            } else if (ev == EVT_DOUBLE_CLICK || ev == EVT_DOUBLE_BLINK) {
                broadcastWebSocket("{\"type\":\"double_click\"}");
            } else if (ev == EVT_QUAD_CLICK) {
                broadcastWebSocket("{\"type\":\"emergency_sos\"}");
            } else if (ev == EVT_LIVE_CLICK) {
                broadcastWebSocket("{\"type\":\"live_click\",\"count\":" + String(liveClickCount) + "}");
            }
        }

        vTaskDelay(pdMS_TO_TICKS(5));
    }
}
