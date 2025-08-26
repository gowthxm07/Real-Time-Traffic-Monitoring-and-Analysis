# Real-Time Traffic Monitoring and Analysis

A traffic monitoring system that uses **YOLO with OpenCV** to detect vehicles in real time, stores traffic details in **Firebase**, and provides a **ReactJS dashboard** for visualizing traffic intensity in different areas.

## Features
- **Vehicle Detection**: Uses YOLO and OpenCV to detect vehicles in real time.
- **Traffic Data Storage**: Saves detected traffic data (vehicle counts, timestamps, area info) in Firebase.
- **Interactive Dashboard**: ReactJS web interface displays traffic intensity in specific areas.
- **Real-Time Updates**: UI fetches live traffic data directly from Firebase.
- **Scalability**: Can be extended to multiple cameras and locations.

## Technologies Used
- **Python**: For backend processing
- **YOLO + OpenCV**: Real-time vehicle detection
- **Firebase**: For storing and syncing traffic data
- **ReactJS**: User interface for traffic visualization

## Installation

### Prerequisites
Ensure you have the following installed:
- Python 3.7 or higher
- Node.js and npm
- Firebase account

1. Clone the repository:
    ```bash
    git clone https://github.com/<your-username>/real-time-traffic-monitoring.git
    cd real-time-traffic-monitoring
    ```
2. Backend Setup (YOLO + OpenCV + Firebase):
    - Navigate to the backend folder:
      ```bash
      cd backend
      ```
    - Create and activate a virtual environment:
      - **On Linux/MacOS:**
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
      - **On Windows:**
        ```bash
        python -m venv venv
        .\venv\Scripts\activate.bat
        ```
    - Install dependencies:
      ```bash
      pip install -r requirements.txt
      ```
    - Run the main detection script:
      ```bash
      python main.py
      ```
      This will start YOLO-based vehicle detection and push traffic data to Firebase.

3. Frontend Setup (ReactJS UI):
    - Navigate to the frontend folder:
      ```bash
      cd ../frontend
      ```
    - Install dependencies:
      ```bash
      npm install
      ```
    - Run the React app:
      ```bash
      npm start
      ```
      The dashboard will run locally on [http://localhost:3000/](http://localhost:3000/).

## Usage
1. Start the backend service (`main.py`) to detect vehicles and send data to Firebase.
   - **Detection Screenshot**
2. Open the frontend React app at [http://localhost:3000/](http://localhost:3000/).
3. View **real-time traffic intensity** updates coming from Firebase in the dashboard.

## Contributing
Feel free to fork the repository, make improvements, or open an issue if you find any bugs or have suggestions for enhancements.

---

**Happy Coding!**
