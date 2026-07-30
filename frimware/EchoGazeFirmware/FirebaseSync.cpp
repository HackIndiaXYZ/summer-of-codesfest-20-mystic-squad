#include "FirebaseSync.h"
#include "Config.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

static String cachedHardwareId = "";

String getHardwareId() {
    if (cachedHardwareId == "") {
        String mac = WiFi.macAddress();
        mac.replace(":", "");
        cachedHardwareId = "ECHO-" + mac;
    }
    return cachedHardwareId;
}

static void syncToFirebase(const char* command, unsigned long timestamp) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        String fullUrl = String(FIREBASE_BASE_URL) + "/users/" + getHardwareId() + "/commands.json";
        http.begin(fullUrl);
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<256> doc;
        String cmdStr = String(command);
        doc["event"] = command;
        doc["timestamp"] = timestamp;
        doc["device_id"] = getHardwareId();
        
        if (cmdStr == "single_click") {
            doc["phrase"] = "Patient triggered single click";
            doc["label"] = "Single Click";
            doc["category"] = "General";
            doc["emoji"] = "👆";
            doc["status"] = "COMPLETED";
        } else if (cmdStr == "double_click") {
            doc["phrase"] = "Patient triggered double click";
            doc["label"] = "Double Click";
            doc["category"] = "General";
            doc["emoji"] = "👆👆";
            doc["status"] = "COMPLETED";
        } else if (cmdStr == "emergency_sos") {
            doc["phrase"] = "Patient triggered emergency SOS";
            doc["label"] = "Emergency SOS";
            doc["category"] = "Emergency";
            doc["emoji"] = "🚨";
            doc["status"] = "EMERGENCY";
        }

        String payload;
        serializeJson(doc, payload);

        http.POST(payload);
        http.end();
    }
}

void syncDeviceStatus() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        String fullUrl = String(FIREBASE_BASE_URL) + "/users/" + getHardwareId() + "/deviceStatus.json";
        http.begin(fullUrl);
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<256> doc;
        doc["uptime"] = millis();
        doc["wifi_rssi"] = WiFi.RSSI();
        doc["firmware_version"] = ECHOGAZE_VERSION;
        doc["lastSeen"] = millis();

        String payload;
        serializeJson(doc, payload);

        http.PUT(payload);
        http.end();
    }
}

void setupFirebaseTask() {
    xTaskCreatePinnedToCore(firebaseTask, "Firebase Task", 8192, NULL, 1, NULL, 0);
}

void firebaseTask(void *pvParameters) {
    unsigned long lastStatusSync = 0;
    for (;;) {
        EventType ev;
        if (xQueueReceive(firebaseQueue, &ev, pdMS_TO_TICKS(1000)) == pdPASS) {
            const char* evtStr = "unknown";
            switch(ev) {
                case EVT_SINGLE_CLICK:
                case EVT_SINGLE_BLINK: evtStr = "single_click"; break;
                case EVT_DOUBLE_CLICK:
                case EVT_DOUBLE_BLINK: evtStr = "double_click"; break;
                case EVT_QUAD_CLICK: evtStr = "emergency_sos"; break;
                default: break;
            }
            if (String(evtStr) != "unknown") {
                syncToFirebase(evtStr, millis());
            }
        }
        
        if (millis() - lastStatusSync >= 30000) {
            syncDeviceStatus();
            lastStatusSync = millis();
        }
    }
}
