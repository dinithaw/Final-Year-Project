#include <WiFi.h>
#include <esp_now.h>

// Replace with receiver MAC address
uint8_t receiverMAC[] = {0x38, 0x18, 0x2b, 0x8b, 0xab, 0x20};

#define POT_X_PIN 32  // Left-Right
#define POT_Y_PIN 34  // Forward-Backward
#define Z_PIN 14      // Sprayer potentiometer

// === Calibration Values ===
const int CENTER_X = 1953;
const int CENTER_Y = 1936;

// Direction thresholds (calibrated)
const int FORWARD_THRESHOLD = 2100;
const int BACKWARD_THRESHOLD = 1800;
const int RIGHT_THRESHOLD = 3100;
const int LEFT_THRESHOLD = 1100;

// Sprayer threshold
const int SPRAY_ON_THRESHOLD = 2400;

typedef struct struct_message {
  bool forward;
  bool backward;
  bool left;
  bool right;
  bool stop;
  bool spray;
} struct_message;

struct_message dataToSend;

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);

  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW init failed!");
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

  Serial.println("ESP-NOW Sender Ready");
}

void loop() {
  int xVal = analogRead(POT_X_PIN); // Left-Right
  int yVal = analogRead(POT_Y_PIN); // Forward-Backward
  int zVal = analogRead(Z_PIN);     // Sprayer

  // Default state
  dataToSend = {false, false, false, false, true, false};

  // Calibrated direction checks
  if (yVal > FORWARD_THRESHOLD) {
    dataToSend.forward = true;
    dataToSend.stop = false;
  } else if (yVal < BACKWARD_THRESHOLD) {
    dataToSend.backward = true;
    dataToSend.stop = false;
  }

  if (xVal > RIGHT_THRESHOLD) {
    dataToSend.right = true;
    dataToSend.stop = false;
  } else if (xVal < LEFT_THRESHOLD) {
    dataToSend.left = true;
    dataToSend.stop = false;
  }

  // Sprayer control - fixed logic
  dataToSend.spray = (zVal < SPRAY_ON_THRESHOLD); // Only activate when below threshold

  // Debug output
  Serial.print("Sprayer Value: ");
  Serial.print(zVal);
  Serial.print(" - Spray State: ");
  Serial.println(dataToSend.spray ? "ON" : "OFF");

  esp_now_send(receiverMAC, (uint8_t *)&dataToSend, sizeof(dataToSend));
  delay(50); // Adjust responsiveness if needed
}