#pragma once

#include <Arduino.h>

void setupFeedback();
void playTone(int frequency, int duration);
void handleFeedback();
void setStatusLed(bool isOn);
void blinkStatusLed(int interval);
