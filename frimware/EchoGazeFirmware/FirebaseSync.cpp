#include "FirebaseSync.h"
#include "Config.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

static String cachedHardwareId = "";
static HTTPClient http;
static bool httpInitialized = false;

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
        if (!httpInitialized) {
            String fullUrl = String(FIREBASE_BASE_URL) + "/users/" + getHardwareId() + "/commands.json";
            http.begin(fullUrl);
            http.setReuse(true); // Keep connection alive to avoid 1500ms TLS handshake latency
            httpInitialized = true;
        }
        
        http.addHeader("Content-Type", "application/json");
        
        StaticJsonDocument<128> doc;
        doc["event"] = command;
        doc["timestamp"] = timestamp;
        doc["device_id"] = getHardwareId();
        
        String payload;
        serializeJson(doc, payload);
        
        http.POST(payload);
    }
}

void setupFirebaseTask() {
    xTaskCreatePinnedToCore(firebaseTask, "Firebase Task", 8192, NULL, 1, NULL, 0);
}

void firebaseTask(void *pvParameters) {
    for (;;) {
        EventType ev;
        if (xQueueReceive(firebaseQueue, &ev, portMAX_DELAY) == pdPASS) {
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
    }
}
