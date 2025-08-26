import cv2
import numpy as np
from ultralytics import YOLO
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import os

# Setting up Firebase Admin SDK
try:
    cred = credentials.Certificate(r"D:\Semester 5\DBMS\Project\trafficmonitoring-84cc6-firebase-adminsdk-fbsvc-364df3b880.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"Failed to initialize Firebase: {e}")
    exit(1)

# Load YOLOv8 model
try:
    model = YOLO("yolov8n.pt")
    print("YOLOv8 model loaded successfully")
except Exception as e:
    print(f"Failed to load YOLOv8 model: {e}")
    exit(1)

def get_traffic_level(vehicle_count):
    if vehicle_count < 5:
        return "Low", 1
    elif 5 <= vehicle_count < 9:
        return "Medium", 3
    else:
        return "High", 7

def calculate_iou(box1, box2):
    x1_max = max(box1[0], box2[0])
    y1_max = max(box1[1], box2[1])
    x2_min = min(box1[2], box2[2])
    y2_min = min(box1[3], box2[3])
    
    intersection = max(0, x2_min - x1_max) * max(0, y2_min - y1_max)
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - intersection
    
    return intersection / union if union > 0 else 0

def monitor_traffic(video_source, area_name="Area1", area_coords={"lat": 40.768044, "lng": -73.981888}):
    try:
        # Debug: Check if video file exists
        if isinstance(video_source, str):
            if not os.path.exists(video_source):
                print(f"Error: Video file does not exist at {video_source}")
                return
            print(f"Opening video file: {video_source}")
        
        cap = cv2.VideoCapture(video_source)
        if not cap.isOpened():
            print(f"Error: Could not open video source {video_source}")
            return

        last_counts = []
        last_upload_time = datetime.now() - timedelta(seconds=10)
        tracks = {}
        accident_detected = False

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                print("End of video or error reading frame")
                break

            frame_resized = cv2.resize(frame, (640, 480))
            results = model.track(frame_resized, persist=True, verbose=False)

            vehicle_count = 0
            current_boxes = []
            for r in results:
                for box in r.boxes:
                    if box.id is None:
                        continue
                    track_id = int(box.id)
                    x1, y1, x2, y2 = box.xyxy[0]
                    cls = int(box.cls)
                    if cls in [1, 2, 3, 5, 7]:
                        vehicle_count += 1
                        current_boxes.append((x1, y1, x2, y2))
                        cv2.rectangle(frame_resized, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
                        cv2.putText(
                            frame_resized,
                            f"{model.names[cls]} ID:{track_id}",
                            (int(x1), int(y1) - 10),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.5,
                            (0, 0, 255),
                            2,
                        )

                        if track_id not in tracks:
                            tracks[track_id] = []
                        tracks[track_id].append((x1, y1, x2, y2))
                        if len(tracks[track_id]) > 5:
                            tracks[track_id].pop(0)

                        if len(tracks[track_id]) == 5:
                            positions = tracks[track_id]
                            if all(np.linalg.norm(np.array(positions[0]) - np.array(p)) < 10 for p in positions):
                                accident_detected = True

            for i in range(len(current_boxes)):
                for j in range(i + 1, len(current_boxes)):
                    if calculate_iou(current_boxes[i], current_boxes[j]) > 0.5:
                        accident_detected = True

            last_counts.append(vehicle_count)
            if len(last_counts) > 10:
                last_counts.pop(0)

            avg_count = np.mean(last_counts)
            traffic_level, clearance_time = get_traffic_level(avg_count)

            if accident_detected:
                try:
                    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    db.collection("accidents").add({
                        "areaName": area_name,
                        "areaNumber": area_name.replace("Area", ""),
                        "time": timestamp,
                        "details": f"Potential accident detected (stopped vehicle or collision) with {vehicle_count} vehicles"
                    })
                    print(f"Accident reported in {area_name} at {timestamp}")
                    accident_detected = False
                except Exception as e:
                    print(f"Failed to report accident to Firebase: {e}")

            cv2.putText(
                frame_resized,
                f"Traffic Level: {traffic_level}",
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 0, 0),
                2,
            )
            cv2.putText(
                frame_resized,
                f"Approx Clearance Time: {clearance_time} seconds",
                (10, 60),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 0, 0),
                2,
            )

            cv2.imshow("Traffic Monitoring", frame_resized)

            current_time = datetime.now()
            if (current_time - last_upload_time).total_seconds() >= 10:
                timestamp = current_time.strftime("%Y-%m-%d %H:%M:%S")
                try:
                    db.collection("traffic_logs").add({
                        "timestamp": timestamp,
                        "traffic_level": traffic_level,
                        "vehicle_count": int(avg_count),
                        "area": area_name,
                        "area_coords": area_coords
                    })
                    print(f"Uploaded traffic data for {area_name} at {timestamp}")
                    last_upload_time = current_time
                except Exception as e:
                    print(f"Failed to upload traffic data to Firebase: {e}")

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    except Exception as e:
        print(f"Error in monitor_traffic: {e}")
    finally:
        cap.release()
        cv2.destroyAllWindows()

# Corrected video path
video_path = r"D:\Semester 5\DBMS\Project\4K Road traffic video for object detection and tracking - free download now.mp4\4K Road traffic video for object detection and tracking - free download now.mp4"
monitor_traffic(
    video_path,
    area_name="Area1",
    area_coords={"lat": 40.768044, "lng": -73.981888}  # Columbus Circle, midpoint of Times Square to Central Park
)