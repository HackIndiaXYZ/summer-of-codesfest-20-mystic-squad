#include "SensorTask.h"
#include "Config.h"
#include "Feedback.h"

volatile int liveClickCount = 0;
void setupSensorTask() {
    pinMode(IR_RECEIVER_PIN, INPUT);
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    pinMode(FLEX_SENSOR_PIN, INPUT);
    xTaskCreatePinnedToCore(sensorTask, "Sensor Task", 4096, NULL, 2, NULL, 1);
}

void sensorTask(void *pvParameters) {
    TickType_t xLastWakeTime = xTaskGetTickCount();
    const TickType_t xFrequency = pdMS_TO_TICKS(SENSOR_READ_INTERVAL_MS);

    bool btnPrevState = HIGH;
    unsigned long lastClickTime = 0;
    int clickCount = 0;
    bool triggerActive = false;

    // Impressive drone startup tone
    for (int freq = 100; freq <= 800; freq += 15) {
        playTone(freq, 15);
    }
    for (int freq = 800; freq >= 400; freq -= 20) {
        playTone(freq, 15);
    }
    delay(50);
    playTone(1200, 150);

    for (;;) {
        unsigned long now = millis();

        // 1. Hardware Button Single-Switch State Machine (Pin 13)
        bool btnCurrentState = digitalRead(BUTTON_PIN);
        bool buttonTriggered = false;
        if (btnPrevState == HIGH && btnCurrentState == LOW) {
            buttonTriggered = true;
        }
        btnPrevState = btnCurrentState;

        // 2. Digital IR Sensor (LOW = Object Detected)
        bool irDetected = (digitalRead(IR_RECEIVER_PIN) == LOW);
        int flexValue = analogRead(FLEX_SENSOR_PIN);
        
        static int flexSmoothed = 0;
        if (flexSmoothed == 0) flexSmoothed = flexValue; // Initialize
        flexSmoothed = (flexSmoothed * 3 + flexValue) / 4; // EMA Filter for noise reduction
        
        bool sensorSignal = irDetected || (flexSmoothed > currentFlexThreshold);
        handleFeedback();

        bool sensorTriggered = false;
        static int consecutiveHigh = 0;
        
        // Require signal to be sustained for 60ms (6 loops at 10ms) to filter out noise spikes
        if (sensorSignal) {
            consecutiveHigh++;
            if (!triggerActive && consecutiveHigh >= 6 && (now - lastClickTime >= (unsigned long)currentDebounceMs)) {
                triggerActive = true;
                sensorTriggered = true;
            }
        } else {
            consecutiveHigh = 0;
            if (triggerActive && (now - lastClickTime >= (unsigned long)currentDebounceMs)) {
                triggerActive = false;
            }
        }

        // Universal Click Logic
        if (buttonTriggered || sensorTriggered) {
            clickCount++;
            lastClickTime = now;
            liveClickCount = clickCount;
            
            EventType evLive = EVT_LIVE_CLICK;
            xQueueSend(wsEventQueue, &evLive, 0);
            
            playTone(2000, 40);
        }

        // 600ms window evaluation
        if (clickCount > 0 && (now - lastClickTime >= 600)) {
            EventType ev;
            bool sendEvent = false;
            if (clickCount == 1) {
                ev = EVT_SINGLE_CLICK;
                sendEvent = true;
            } else if (clickCount == 2) {
                ev = EVT_DOUBLE_CLICK;
                sendEvent = true;
            } else if (clickCount == 3) {
                ev = EVT_TRIPLE_CLICK;
                sendEvent = true;
            } else if (clickCount >= 4) {
                ev = EVT_QUAD_CLICK;
                sendEvent = true;
                playAmbulanceSiren(3000);
            }
            
            if (sendEvent) {
                xQueueSend(wsEventQueue, &ev, 0);
                xQueueSend(firebaseQueue, &ev, 0);
            }
            clickCount = 0;
            liveClickCount = 0;
        }

        vTaskDelayUntil(&xLastWakeTime, xFrequency);
    }
}
