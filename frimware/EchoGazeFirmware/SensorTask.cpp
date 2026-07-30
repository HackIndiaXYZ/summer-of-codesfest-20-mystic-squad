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

    // Ready beep
    playTone(1500, 100);
    delay(100);
    playTone(2000, 100);

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
        
        bool sensorSignal = irDetected || (flexValue > currentFlexThreshold);
        handleFeedback();

        bool sensorTriggered = false;
        // Non-Blocking Debounce State Machine for IR / Flex
        if (sensorSignal) {
            if (!triggerActive && (now - lastClickTime >= (unsigned long)currentDebounceMs)) {
                triggerActive = true;
                sensorTriggered = true;
            }
        } else {
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
            } else if (clickCount >= 4) {
                ev = EVT_QUAD_CLICK;
                sendEvent = true;
                playTone(3000, 300);
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
