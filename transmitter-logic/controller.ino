#include <WiFi.h>
#include <esp_now.h>

// Replace with receiver MAC address
uint8_t receiverMAC[] = {0x24, 0x6F, 0x28, 0x12, 0x34, 0x56};

#define POT_X_PIN 34  // Left-Right
#define POT_Y_PIN 35  // Forward-Backward

// ADC range is 0–4095 (12-bit)
// Center is approx. 2048 for ideal centered joystick

// === Calibration Values ===
const int CENTER_X = 2048;
const int CENTER_Y = 2048;

// Set custom thresholds for each direction (calibrated)
const int FORWARD_THRESHOLD = 2250;   // above this = forward
const int BACKWARD_THRESHOLD = 1800;  // below this = backward

const int RIGHT_THRESHOLD = 2350;     // above this = right
const int LEFT_THRESHOLD = 1750;      // below this = left

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

  // Default state
  dataToSend = {false, false, false, false, true};

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

  esp_now_send(receiverMAC, (uint8_t *)&dataToSend, sizeof(dataToSend));

  delay(100); // adjust responsiveness
}