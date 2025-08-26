// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxfoohOxgLDHD65YfvbXELc0_ku37iBNA",
  authDomain: "trafficmonitoring-84cc6.firebaseapp.com",
  projectId: "trafficmonitoring-84cc6",
  storageBucket: "trafficmonitoring-84cc6.firebasestorage.app",
  messagingSenderId: "434161099709",
  appId: "1:434161099709:web:0512d0f6cc09c76fdce8d4",
  measurementId: "G-ZS99XR4E6D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db as firestore };