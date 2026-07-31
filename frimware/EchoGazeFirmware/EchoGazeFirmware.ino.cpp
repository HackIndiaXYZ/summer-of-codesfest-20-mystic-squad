# 1 "/tmp/tmp84au7rly"
#include <Arduino.h>
# 1 "/home/j0x/Documents/GitHub/summer-of-codesfest-20-mystic-squad/frimware/EchoGazeFirmware/EchoGazeFirmware.ino"
#include <Arduino.h>
#include "Config.h"
#include "Feedback.h"
#include "NetworkTask.h"
#include "SensorTask.h"
#include "FirebaseSync.h"


volatile int currentFlexThreshold = DEFAULT_FLEX_THRESHOLD;
volatile int currentDebounceMs = DEFAULT_DEBOUNCE_MS;
volatile int currentDoubleBlinkWindowMs = DEFAULT_DOUBLE_BLINK_WINDOW_MS;

QueueHandle_t wsEventQueue;
QueueHandle_t firebaseQueue;
QueueHandle_t customMsgQueue;
void setup();
void loop();
#line 19 "/home/j0x/Documents/GitHub/summer-of-codesfest-20-mystic-squad/frimware/EchoGazeFirmware/EchoGazeFirmware.ino"
void setup() {
    Serial.begin(115200);
    Serial.println("Starting EchoGaze v" ECHOGAZE_VERSION "...");


    wsEventQueue = xQueueCreate(10, sizeof(EventType));
    firebaseQueue = xQueueCreate(10, sizeof(EventType));
    customMsgQueue = xQueueCreate(5, sizeof(CustomMsg));


    setupFeedback();


    setupNetworkTask();
    setupFirebaseTask();
    setupSensorTask();


    vTaskDelete(NULL);
}

void loop() {

}