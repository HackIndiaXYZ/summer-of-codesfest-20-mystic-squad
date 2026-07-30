#pragma once

#include <Arduino.h>

void setupFirebaseTask();
void firebaseTask(void *pvParameters);
String generateHardwareId();
