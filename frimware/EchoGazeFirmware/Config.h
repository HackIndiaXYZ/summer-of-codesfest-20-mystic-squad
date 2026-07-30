#pragma once

#include <Arduino.h>

// EchoGaze Firmware Configuration
#define ECHOGAZE_VERSION "2.5.0-PRO"

// Hardware Pin Definitions (ESP32 DevKit V1 Pinout)
#define IR_EMITTER_PIN  12 // Digital output for IR LED demodulation
#define IR_RECEIVER_PIN 34 // Analog input for photodiode (ADC1_CH6)
#define BUTTON_PIN      13 // Digital input for physical single-switch (Internal Pullup)
#define FLEX_SENSOR_PIN 35 // Analog input for flex sensor (ADC1_CH7)
#define PIEZO_PIN       14 // PWM output for piezo buzzer feedback
#define ONBOARD_LED_PIN 2  // Standard ESP32 status LED

// WiFi & Network Defaults
#define AP_SSID_PREFIX "EchoGaze-"
#define AP_DEFAULT_PASSWORD "12345678"
#define FIREBASE_URL "https://echo-gaze-default-rtdb.firebaseio.com/selections.json"

// Sensor Processing Thresholds
#define DEFAULT_BLINK_THRESHOLD 300 
#define DEFAULT_FLEX_THRESHOLD 2000
#define DEFAULT_DEBOUNCE_MS 120
#define DEFAULT_DOUBLE_BLINK_WINDOW_MS 500 

// Advanced Signal Processing
#define SENSOR_READ_INTERVAL_MS 10 // 100Hz sampling rate
#define SENSOR_SETTLE_TIME_US 300  // Allow IR LED to reach full brightness
#define EMA_ALPHA 0.25 // Smoothing factor for Exponential Moving Average
#define AUTO_CALIBRATION_TIME_MS 2000 // Quick auto-calibration on boot

// Piezo Configuration
#define PIEZO_CHANNEL 0            

// Hardware Event Types
enum EventType {
    EVT_SINGLE_BLINK,
    EVT_DOUBLE_BLINK,
    EVT_SINGLE_CLICK,
    EVT_DOUBLE_CLICK,
    EVT_QUAD_CLICK,
    EVT_LIVE_CLICK
};

extern volatile int liveClickCount;

// Global configurable thresholds
extern volatile int currentBlinkThreshold;
extern volatile int currentFlexThreshold;
extern volatile int currentDebounceMs;
extern volatile int currentDoubleBlinkWindowMs;

// FreeRTOS Inter-Task Communication Queues
extern QueueHandle_t wsEventQueue;
extern QueueHandle_t firebaseQueue;
