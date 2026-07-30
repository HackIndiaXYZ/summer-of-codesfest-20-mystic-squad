#include "Feedback.h"
#include "Config.h"

static unsigned long toneStartTime = 0;
static unsigned long toneDuration = 0;
static bool isTonePlaying = false;

static unsigned long ledBlinkStartTime = 0;
static int ledBlinkInterval = 0;
static bool ledState = false;

void setupFeedback() {
    pinMode(ONBOARD_LED_PIN, OUTPUT);
}

void playTone(int frequency, int duration) {
    tone(PIEZO_PIN, frequency);
    toneStartTime = millis();
    toneDuration = duration;
    isTonePlaying = true;
}

void handleFeedback() {
    unsigned long now = millis();
    
    // Auto-stop piezo after duration expires
    if (isTonePlaying && (now - toneStartTime >= toneDuration)) {
        noTone(PIEZO_PIN);
        isTonePlaying = false;
    }
    
    // Non-blocking LED blink at configured interval
    if (ledBlinkInterval > 0) {
        if (now - ledBlinkStartTime >= (unsigned long)ledBlinkInterval) {
            ledBlinkStartTime = now;
            ledState = !ledState;
            digitalWrite(ONBOARD_LED_PIN, ledState);
        }
    }
}

void setStatusLed(bool isOn) {
    ledBlinkInterval = 0;
    digitalWrite(ONBOARD_LED_PIN, isOn);
}

void blinkStatusLed(int interval) {
    ledBlinkInterval = interval;
}
