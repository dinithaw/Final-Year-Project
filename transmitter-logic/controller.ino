#include <WiFi.h>
#include <esp_now.h>

// MAC address of the receiver ESP32
uint8_t receiverMAC[] = {0x24, 0x6F, 0x28, 0x12, 0x34, 0x56};

#define POT_X_PIN 34
#define POT_Y_PIN 35
#define THRESHOLD 300  // Adjust this based on your pot sensitivity (ADC center is ~2048 for 3.3V)

typedef struct struct_message {
  bool forward;
  bool backward;
  bool left;
  bool right;
  bool stop;
} struct_message;

struct_message dataToSend;

void setup() {
  Serial.begin(115200);

  WiFi.mode(WIFI_STA);
  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW Init Failed");
    return;
  }

  esp_now_peer_info_t peerInfo = {};
  memcpy(peerInfo.peer_addr, receiverMAC, 6);
  peerInfo.channel = 0;
  peerInfo.encrypt = false;

  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    Serial.println("Failed to add peer");
    return;
  }
}

void loop() {
  int xValue = analogRead(POT_X_PIN);
  int yValue = analogRead(POT_Y_PIN);

  // Reset all directions
  dataToSend = {false, false, false, false, true};

  if (yValue > 2048 + THRESHOLD) {
    dataToSend.forward = true;
    dataToSend.stop = false;
  } else if (yValue < 2048 - THRESHOLD) {
    dataToSend.backward = true;
    dataToSend.stop = false;
  }

  if (xValue > 2048 + THRESHOLD) {
    dataToSend.right = true;
    dataToSend.stop = false;
  } else if (xValue < 2048 - THRESHOLD) {
    dataToSend.left = true;
    dataToSend.stop = false;
  }

  esp_now_send(receiverMAC, (uint8_t *)&dataToSend, sizeof(dataToSend));
  delay(100);  // Adjust for responsiveness
}