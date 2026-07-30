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

static String idToken = "";
static unsigned long tokenExpiry = 0;

void authenticateFirebase() {
    if (WiFi.status() != WL_CONNECTED) return;
    
    // Check if token is still valid (give 5 minutes buffer)
    if (idToken != "" && (millis() < tokenExpiry || tokenExpiry == 0)) {
        return; 
    }

    HTTPClient http;
    String url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + String(FIREBASE_API_KEY);
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["email"] = FIREBASE_AUTH_EMAIL;
    doc["password"] = FIREBASE_AUTH_PASSWORD;
    doc["returnSecureToken"] = true;

    String payload;
    serializeJson(doc, payload);

    int httpCode = http.POST(payload);
    if (httpCode == HTTP_CODE_OK) {
        String response = http.getString();
        DynamicJsonDocument resDoc(2048);
        DeserializationError error = deserializeJson(resDoc, response);
        if (!error) {
            idToken = resDoc["idToken"].as<String>();
            long expiresIn = resDoc["expiresIn"].as<long>(); 
            tokenExpiry = millis() + ((expiresIn - 300) * 1000); 
            Serial.println("Firebase authenticated successfully");
        } else {
            Serial.print("Firebase auth JSON parse failed: ");
            Serial.println(error.c_str());
            idToken = "";
        }
    } else {
        Serial.printf("Firebase auth failed: %d\n", httpCode);
        idToken = "";
    }
    http.end();
}

static void syncToFirebase(const char* command, unsigned long timestamp) {
    if (WiFi.status() == WL_CONNECTED) {
        authenticateFirebase();
        if (idToken == "") return;
        
        HTTPClient http;
        String fullUrl = String(FIREBASE_BASE_URL) + "/users/" + getHardwareId() + "/commands.json?auth=" + idToken;
        http.begin(fullUrl);
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<256> doc;
        String cmdStr = String(command);
        doc["event"] = command;
        
        JsonObject tsObj = doc.createNestedObject("timestamp");
        tsObj[".sv"] = "timestamp";
        
        doc["device_id"] = getHardwareId();
        
        if (cmdStr == "emergency_sos") {
            doc["phrase"] = "Patient triggered emergency SOS";
            doc["label"] = "Emergency SOS";
            doc["category"] = "Emergency";
            doc["emoji"] = "🚨";
            doc["status"] = "EMERGENCY";
        } else if (cmdStr == "single_click") {
            doc["phrase"] = "Patient wants water";
            doc["category"] = "Grid";
            doc["emoji"] = "💧";
            doc["status"] = "COMPLETED";
        } else if (cmdStr == "double_click") {
            doc["phrase"] = "Patient needs to use washroom";
            doc["category"] = "Grid";
            doc["emoji"] = "🚽";
            doc["status"] = "COMPLETED";
        } else if (cmdStr == "triple_click") {
            doc["phrase"] = "Patient wants food";
            doc["category"] = "Grid";
            doc["emoji"] = "🍲";
            doc["status"] = "COMPLETED";
        } else {
            return; // Only sync specific mapped commands to Firebase
        }

        String payload;
        serializeJson(doc, payload);

        http.POST(payload);
        http.end();
    }
}

static void syncCustomToFirebase(const CustomMsg& msg, unsigned long timestamp) {
    if (WiFi.status() == WL_CONNECTED) {
        authenticateFirebase();
        if (idToken == "") return;
        
        HTTPClient http;
        String fullUrl = String(FIREBASE_BASE_URL) + "/users/" + getHardwareId() + "/commands.json?auth=" + idToken;
        http.begin(fullUrl);
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<256> doc;
        doc["event"] = "custom_message";
        
        JsonObject tsObj = doc.createNestedObject("timestamp");
        tsObj[".sv"] = "timestamp";
        
        doc["device_id"] = getHardwareId();
        doc["phrase"] = msg.phrase;
        doc["category"] = msg.category;
        doc["emoji"] = msg.emoji;
        doc["status"] = "COMPLETED";

        String payload;
        serializeJson(doc, payload);

        http.POST(payload);
        http.end();
    }
}

void syncDeviceStatus() {
    if (WiFi.status() == WL_CONNECTED) {
        authenticateFirebase();
        if (idToken == "") return;
        
        HTTPClient http;
        String fullUrl = String(FIREBASE_BASE_URL) + "/users/" + getHardwareId() + "/deviceStatus.json?auth=" + idToken;
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
    xTaskCreatePinnedToCore(firebaseTask, "Firebase Task", 12288, NULL, 1, NULL, 0);
}

void firebaseTask(void *pvParameters) {
    unsigned long lastStatusSync = 0;
    for (;;) {
        EventType ev;
        if (xQueueReceive(firebaseQueue, &ev, pdMS_TO_TICKS(100)) == pdPASS) {
            const char* evtStr = "unknown";
            switch(ev) {
                case EVT_SINGLE_CLICK:
                case EVT_SINGLE_BLINK: evtStr = "single_click"; break;
                case EVT_DOUBLE_CLICK:
                case EVT_DOUBLE_BLINK: evtStr = "double_click"; break;
                case EVT_TRIPLE_CLICK: evtStr = "triple_click"; break;
                case EVT_QUAD_CLICK: evtStr = "emergency_sos"; break;
                default: break;
            }
            if (String(evtStr) != "unknown") {
                syncToFirebase(evtStr, millis());
            }
        }
        
        CustomMsg msg;
        if (xQueueReceive(customMsgQueue, &msg, 0) == pdPASS) {
            syncCustomToFirebase(msg, millis());
        }
        
        if (millis() - lastStatusSync >= 30000) {
            syncDeviceStatus();
            lastStatusSync = millis();
        }
    }
}
