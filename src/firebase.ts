import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB2p90Z_b8nxQDvLQ_SHX9v5eazFrNIOv4",
  authDomain: "live-dashboard-44227.firebaseapp.com",
  databaseURL: "https://live-dashboard-44227-default-rtdb.firebaseio.com",
  projectId: "live-dashboard-44227",
  storageBucket: "live-dashboard-44227.firebasestorage.app",
  messagingSenderId: "554608483434",
  appId: "1:554608483434:web:dfb39d76a8a37a9b0abe13"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
