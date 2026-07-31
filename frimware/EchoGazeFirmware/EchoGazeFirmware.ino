#include <Arduino.h>
#include "Config.h"
#include "Feedback.h"
#include "NetworkTask.h"
#include "SensorTask.h"
#include "FirebaseSync.h"

// Global Instances & Queues
volatile int currentFlexThreshold = DEFAULT_FLEX_THRESHOLD;
volatile int currentDebounceMs = DEFAULT_DEBOUNCE_MS;
volatile int currentDoubleBlinkWindowMs = DEFAULT_DOUBLE_BLINK_WINDOW_MS;

QueueHandle_t wsEventQueue;
QueueHandle_t firebaseQueue;

// Setup (Runs on Core 1 once at boot)

void setup() {
    Serial.begin(115200);
    Serial.println("Starting EchoGaze v" ECHOGAZE_VERSION "...");

    // Initialize Queues
    wsEventQueue = xQueueCreate(10, sizeof(EventType));
    firebaseQueue = xQueueCreate(10, sizeof(EventType));
    
    // Initialize Hardware Subsystems
    setupFeedback();

    // Start Task Modules
    setupNetworkTask();  // Core 0: WiFi, WebSocket, WebServer
    setupFirebaseTask(); // Core 0: HTTPS Firebase Sync
    setupSensorTask();   // Core 1: Digital IR Sensor IR Sensor & Demodulation Button

    // Setup completes, delete default Arduino loop task
    vTaskDelete(NULL);
}

void loop() {
    // Intentionally empty. Default task is deleted at end of setup().
}
