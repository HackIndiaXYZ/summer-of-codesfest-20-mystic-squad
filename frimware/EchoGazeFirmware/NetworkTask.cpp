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
#include <ESPmDNS.h>

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
        if (cmd == "set_debounce") {
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

// Helper to serve SPIFFS files removed in favor of serveStatic

void setupNetworkTask() {
    if (!SPIFFS.begin(true)) {
        Serial.println("SPIFFS Mount Failed - formatting");
    }

    WiFi.mode(WIFI_STA);

    Preferences prefs;
    prefs.begin("echogaze", true);
    String sta_ssid = prefs.getString("ssid", "");
    String sta_pass = prefs.getString("pass", "");
    prefs.end();

    if (sta_ssid.length() == 0 && String(DEFAULT_WIFI_SSID) != "Your_WiFi_SSID") {
        sta_ssid = DEFAULT_WIFI_SSID;
        sta_pass = DEFAULT_WIFI_PASSWORD;
    }

    bool ap_mode_needed = true;

    if (sta_ssid.length() > 0) {
        Serial.println("Connecting to STA: " + sta_ssid);
        WiFi.begin(sta_ssid.c_str(), sta_pass.c_str());
        
        // Wait up to 10 seconds for connection
        int attempts = 0;
        while (WiFi.status() != WL_CONNECTED && attempts < 20) {
            delay(500);
            Serial.print(".");
            attempts++;
        }
        
        if (WiFi.status() == WL_CONNECTED) {
            Serial.println("\nWiFi connected.");
            Serial.print("IP Address: ");
            Serial.println(WiFi.localIP());
            if (MDNS.begin("echogaze")) {
                Serial.println("MDNS responder started at http://echogaze.local");
            }
            ap_mode_needed = false;
        } else {
            Serial.println("\nWiFi connection failed. Falling back to AP mode.");
        }
    }

    if (ap_mode_needed) {
        WiFi.mode(WIFI_AP_STA);
        String mac = WiFi.macAddress();
        mac.replace(":", "");
        String apSsid = AP_SSID_PREFIX + mac.substring(mac.length() - 4);
        WiFi.softAP(apSsid.c_str(), AP_DEFAULT_PASSWORD);
        dnsServer.start(53, "*", WiFi.softAPIP());
        Serial.println("AP Mode started: " + apSsid);
        Serial.print("AP IP Address: ");
        Serial.println(WiFi.softAPIP());
    }

    // WebSocket on port 81
    webSocket.begin();
    webSocket.onEvent(onWsEvent);

    // Serve static files from SPIFFS natively
    server.serveStatic("/", SPIFFS, "/");

    // Handle captive portal requests and unknown paths
    server.onNotFound([]() {
        if (!SPIFFS.exists("/index.html")) {
            server.send(500, "text/plain", "Error: SPIFFS Data Missing! Please run 'Upload File System image' in PlatformIO.");
            return;
        }
        String redirectIp = (WiFi.getMode() & WIFI_AP) ? WiFi.softAPIP().toString() : WiFi.localIP().toString();
        server.sendHeader("Location", "http://" + redirectIp + "/");
        server.send(302, "text/plain", "Redirecting...");
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

            // Also print IP to Serial monitor periodically so it's easy to find
            if (WiFi.status() == WL_CONNECTED) {
                Serial.println("Webserver is live at IP: " + WiFi.localIP().toString());
            } else {
                Serial.println("Webserver is live at AP IP: " + WiFi.softAPIP().toString());
            }
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
