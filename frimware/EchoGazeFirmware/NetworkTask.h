#pragma once

#include <Arduino.h>

void setupNetworkTask();
void networkTask(void *pvParameters);
int getConnectedWebSockets();
