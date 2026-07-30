#include "Feedback.h"
#include "Config.h"

static unsigned long toneStartTime = 0;
static unsigned long toneDuration = 0;
static bool isTonePlaying = false;

static unsigned long ledBlinkStartTime = 0;
static int ledBlinkInterval = 0;
static bool ledState = false;

static bool isSirenPlaying = false;
static unsigned long sirenStartTime = 0;
static int sirenDuration = 0;
static unsigned long sirenToggleTime = 0;
static bool sirenHigh = false;

void setupFeedback() {
    pinMode(ONBOARD_LED_PIN, OUTPUT);
    pinMode(PIEZO_PIN, OUTPUT);
    digitalWrite(PIEZO_PIN, LOW);
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
    if (isTonePlaying && !isSirenPlaying && (now - toneStartTime >= toneDuration)) {
        noTone(PIEZO_PIN);
        isTonePlaying = false;
    }
    
    // Ambulance siren logic
    if (isSirenPlaying) {
        if (now - sirenStartTime >= sirenDuration) {
            noTone(PIEZO_PIN);
            digitalWrite(PIEZO_PIN, LOW);
            isSirenPlaying = false;
            isTonePlaying = false;
        } else if (now - sirenToggleTime >= 400) { // 400ms ON, 400ms OFF pacing
            sirenToggleTime = now;
            sirenHigh = !sirenHigh;
            if (sirenHigh) {
                noTone(PIEZO_PIN);
                digitalWrite(PIEZO_PIN, HIGH);
            } else {
                tone(PIEZO_PIN, 500);
            }
        }
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

void playAmbulanceSiren(int duration) {
    isSirenPlaying = true;
    sirenStartTime = millis();
    sirenDuration = duration;
    sirenToggleTime = millis();
    sirenHigh = true;
    noTone(PIEZO_PIN);
    digitalWrite(PIEZO_PIN, HIGH);
}

void setStatusLed(bool isOn) {
    ledBlinkInterval = 0;
    digitalWrite(ONBOARD_LED_PIN, isOn);
}

void blinkStatusLed(int interval) {
    ledBlinkInterval = interval;
}
