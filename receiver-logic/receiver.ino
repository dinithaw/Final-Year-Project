#include <WiFi.h>
#include <esp_now.h>

// Motor pins
#define L1_IN1 2
#define L1_IN2 4
#define L2_IN3 16
#define L2_IN4 17

#define R1_IN1 5
#define R1_IN2 18
#define R2_IN3 19
#define R2_IN4 21

#define SPRAYER_PIN 22
bool sprayerOn = false;

// Match the transmitter's struct
typedef struct struct_message {
  bool forward;
  bool backward;
  bool left;
  bool right;
  bool stop;
  bool spray;
} struct_message;

struct_message incomingData;

// Motor control
void stopMotors() {
  digitalWrite(L1_IN1, LOW); digitalWrite(L1_IN2, LOW);
  digitalWrite(L2_IN3, LOW); digitalWrite(L2_IN4, LOW);
  digitalWrite(R1_IN1, LOW); digitalWrite(R1_IN2, LOW);
  digitalWrite(R2_IN3, LOW); digitalWrite(R2_IN4, LOW);
}

void moveForward() {
  digitalWrite(L1_IN1, HIGH); digitalWrite(L1_IN2, LOW);
  digitalWrite(L2_IN3, HIGH); digitalWrite(L2_IN4, LOW);
  digitalWrite(R1_IN1, HIGH); digitalWrite(R1_IN2, LOW);
  digitalWrite(R2_IN3, HIGH); digitalWrite(R2_IN4, LOW);
}

void moveBackward() {
  digitalWrite(L1_IN1, LOW); digitalWrite(L1_IN2, HIGH);
  digitalWrite(L2_IN3, LOW); digitalWrite(L2_IN4, HIGH);
  digitalWrite(R1_IN1, LOW); digitalWrite(R1_IN2, HIGH);
  digitalWrite(R2_IN3, LOW); digitalWrite(R2_IN4, HIGH);
}

void turnLeft() {
  digitalWrite(L1_IN1, LOW); digitalWrite(L1_IN2, HIGH);
  digitalWrite(L2_IN3, LOW); digitalWrite(L2_IN4, HIGH);
  digitalWrite(R1_IN1, HIGH); digitalWrite(R1_IN2, LOW);
  digitalWrite(R2_IN3, HIGH); digitalWrite(R2_IN4, LOW);
}

void turnRight() {
  digitalWrite(L1_IN1, HIGH); digitalWrite(L1_IN2, LOW);
  digitalWrite(L2_IN3, HIGH); digitalWrite(L2_IN4, LOW);
  digitalWrite(R1_IN1, LOW); digitalWrite(R1_IN2, HIGH);
  digitalWrite(R2_IN3, LOW); digitalWrite(R2_IN4, HIGH);
}

void handleSprayer(bool spray) {
  if (spray != sprayerOn) {
    sprayerOn = spray;
    digitalWrite(SPRAYER_PIN, sprayerOn ? HIGH : LOW);
    Serial.println(sprayerOn ? "Sprayer ON" : "Sprayer OFF");
  }
}

// ESP-NOW receive callback
void onDataRecv(const esp_now_recv_info_t *info, const uint8_t *data, int len) {
  if (len == sizeof(incomingData)) {
    memcpy(&incomingData, data, sizeof(incomingData));
    Serial.println("Command received:");

    // Movement logic
    if (incomingData.forward) {
      moveForward();
      Serial.println("Moving Forward");
    } else if (incomingData.backward) {
      moveBackward();
      Serial.println("Moving Backward");
    } else if (incomingData.left) {
      turnLeft();
      Serial.println("Turning Left");
    } else if (incomingData.right) {
      turnRight();
      Serial.println("Turning Right");
    } else if (incomingData.stop) {
      stopMotors();
      Serial.println("Stopping");
    }

    // Sprayer control
    handleSprayer(incomingData.spray);
  } else {
    Serial.println("Invalid data received");
  }
}

void setup() {
  Serial.begin(115200);

  // Set motor pins
  pinMode(L1_IN1, OUTPUT); pinMode(L1_IN2, OUTPUT);
  pinMode(L2_IN3, OUTPUT); pinMode(L2_IN4, OUTPUT);
  pinMode(R1_IN1, OUTPUT); pinMode(R1_IN2, OUTPUT);
  pinMode(R2_IN3, OUTPUT); pinMode(R2_IN4, OUTPUT);

  // Sprayer pin
  pinMode(SPRAYER_PIN, OUTPUT);
  digitalWrite(SPRAYER_PIN, LOW);

  stopMotors();

  // ESP-NOW setup
  WiFi.mode(WIFI_STA);
  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW init failed");
    return;
  }

  esp_now_register_recv_cb(onDataRecv);
}

void loop() {
  // No logic needed here; all handled by callback
}
