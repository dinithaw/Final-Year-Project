import cv2
from ultralytics import YOLO

# Load the trained model
model = YOLO('YOLOv8_batch.pt')  # Make sure this is the correct path to your model

# Open webcam (0 = default camera)
cap = cv2.VideoCapture(0)

# Check if camera opened successfully
if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame.")
        break

    # Resize frame for faster inference (optional)
    resized_frame = cv2.resize(frame, (320, 320))

    # Run inference
    results = model(resized_frame, verbose=False)

    # Get prediction
    label = results[0].names[results[0].probs.top1]
    confidence = results[0].probs.data[results[0].probs.top1].item()

    # Overlay label on frame
    cv2.putText(frame, f'{label} ({confidence:.2f})', (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    # Display result
    cv2.imshow('Rice Disease Detection', frame)

    # Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()