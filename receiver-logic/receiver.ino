#include <WiFi.h>
#include <esp_now.h>

// Motor Pins
#define L1_IN1 2
#define L1_IN2 4
#define L2_IN3 16
#define L2_IN4 17

#define R1_IN1 5
#define R1_IN2 18
#define R2_IN3 19
#define R2_IN4 21

#define SPRAYER_PIN 22
bool sprayerOn = false; // Tracks current state

// Struct matches transmitter
typedef struct struct_message {
  bool forward;
  bool backward;
  bool left;
  bool right;
  bool stop;
  bool spray;
} struct_message;

struct_message incomingData;

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


void onDataRecv(const esp_now_recv_info_t *info, const uint8_t *data, int len) {
  if (len != sizeof(struct_message)) {
    Serial.println("Invalid data size received");
    return;
  }

  memcpy(&incomingData, data, sizeof(incomingData));
  Serial.print("Data received: ");
  Serial.print("F:"); Serial.print(incomingData.forward);
  Serial.print(" B:"); Serial.print(incomingData.backward);
  Serial.print(" L:"); Serial.print(incomingData.left);
  Serial.print(" R:"); Serial.print(incomingData.right);
  Serial.print(" S:"); Serial.print(incomingData.stop);
  Serial.print(" Spray:"); Serial.println(incomingData.spray);

  // Movement logic
  if (incomingData.forward) {
    moveForward();
  } else if (incomingData.backward) {
    moveBackward();
  } else if (incomingData.left) {
    turnLeft();
  } else if (incomingData.right) {
    turnRight();
  } else if (incomingData.stop) {
    stopMotors();
  }

  // Sprayer logic
  if(incomingData.spray){
    digitalWrite(SPRAYER_PIN, HIGH);
  }
  else{
    digitalWrite(SPRAYER_PIN, LOW);
  }

}

void setup() {
  Serial.begin(115200);

  pinMode(L1_IN1, OUTPUT); pinMode(L1_IN2, OUTPUT);
  pinMode(L2_IN3, OUTPUT); pinMode(L2_IN4, OUTPUT);
  pinMode(R1_IN1, OUTPUT); pinMode(R1_IN2, OUTPUT);
  pinMode(R2_IN3, OUTPUT); pinMode(R2_IN4, OUTPUT);
  pinMode(SPRAYER_PIN, OUTPUT);
  digitalWrite(SPRAYER_PIN, LOW);

  WiFi.mode(WIFI_STA);
  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW init failed!");
    return;
  }

  esp_now_register_recv_cb(onDataRecv);
  stopMotors();
  sprayerOn = false;
}

void loop() {
  // Everything is handled in callback
}
