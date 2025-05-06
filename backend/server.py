from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
from threading import Lock
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

# Load YOLOv8 classification model
model = YOLO('YOLOv8_batch.pt')

detected_objects = []
lock = Lock()

def generate_frames():
    global detected_objects
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Camera could not be opened.")
        return

    while True:
        success, frame = cap.read()
        if not success:
            print("Error: Frame capture failed.")
            break

        try:
            results = model(frame, verbose=False)
        except Exception as e:
            print(f"Error during model inference: {e}")
            continue

        temp_detected_objects = []

        try:
            for result in results:
                probs = result.probs
                if probs is not None:
                    cls_idx = probs.top1
                    label = result.names[cls_idx]
                    conf = probs.data[cls_idx].item()

                    temp_detected_objects.append((label, conf))

                    # Display the label and confidence on the frame
                    cv2.putText(frame, f'{label} ({conf:.2f})', (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        except Exception as e:
            print(f"Error during classification processing: {e}")

        with lock:
            detected_objects = temp_detected_objects

        try:
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                print("Error: Frame encoding failed.")
                continue
            frame = buffer.tobytes()
        except Exception as e:
            print(f"Error during frame encoding: {e}")
            continue

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/detection_results')
def detection_results():
    global detected_objects
    detection_summary = {}

    with lock:
        for label, conf in detected_objects:
            if label in detection_summary:
                detection_summary[label]['count'] += 1
                detection_summary[label]['scores'].append(conf)
            else:
                detection_summary[label] = {'count': 1, 'scores': [conf]}

    for label in detection_summary:
        scores = detection_summary[label]['scores']
        detection_summary[label]['average_score'] = sum(scores) / len(scores)

    formatted_summary = {
        f"{label} (avg score: {detection_summary[label]['average_score']:.2f})":
        detection_summary[label]['count'] for label in detection_summary
    }

    return jsonify(formatted_summary)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)