#pragma once

#include <Arduino.h>

// EchoGaze Firmware Configuration
#define ECHOGAZE_VERSION "3.0.0-LIVE"

#define IR_RECEIVER_PIN 34 // Digital input for IR sensor
#define BUTTON_PIN      13 // Digital input for physical single-switch (Internal Pullup)
#define FLEX_SENSOR_PIN 35 // Analog input for flex sensor (ADC1_CH7)
#define PIEZO_PIN       14 // PWM output for piezo buzzer feedback
#define ONBOARD_LED_PIN 2  // Standard ESP32 status LED

// WiFi & Network Defaults
#define AP_SSID_PREFIX "EchoGaze-"
#define AP_DEFAULT_PASSWORD "12345678"
#define DEFAULT_WIFI_SSID "Gandu"
#define DEFAULT_WIFI_PASSWORD "12345678"
#define FIREBASE_BASE_URL "https://echo-gaze-default-rtdb.firebaseio.com"
#define FIREBASE_API_KEY "AIzaSyAW0QMBgmGzFivEWOMNla66ff3AX8XZJqg"
#define FIREBASE_AUTH_EMAIL "device.echogaze@zekoy.online"
#define FIREBASE_AUTH_PASSWORD "ECHO_DEVICE_PASS_2026"

// Sensor Processing Thresholds
#define DEFAULT_FLEX_THRESHOLD 2500
#define DEFAULT_DEBOUNCE_MS 180
#define DEFAULT_DOUBLE_BLINK_WINDOW_MS 500 

// Advanced Signal Processing
#define SENSOR_READ_INTERVAL_MS 10 // 100Hz sampling rate

// Piezo Configuration
#define PIEZO_CHANNEL 0            

// Hardware Event Types
enum EventType {
    EVT_SINGLE_BLINK,
    EVT_DOUBLE_BLINK,
    EVT_SINGLE_CLICK,
    EVT_DOUBLE_CLICK,
    EVT_TRIPLE_CLICK,
    EVT_QUAD_CLICK,
    EVT_LIVE_CLICK
};

extern volatile int liveClickCount;

// Global configurable thresholds
extern volatile int currentFlexThreshold;
extern volatile int currentDebounceMs;
extern volatile int currentDoubleBlinkWindowMs;

// FreeRTOS Inter-Task Communication Queues
extern QueueHandle_t wsEventQueue;
extern QueueHandle_t firebaseQueue;

struct CustomMsg {
    char phrase[64];
    char category[32];
    char emoji[8];
};
extern QueueHandle_t customMsgQueue;
