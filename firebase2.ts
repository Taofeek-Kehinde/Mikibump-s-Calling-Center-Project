// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9E88kBCn5l6ljUlYaN4jjjkquvNbY3uU",
  authDomain: "talkincandy-qr.firebaseapp.com",
  projectId: "talkincandy-qr",
  storageBucket: "talkincandy-qr.firebasestorage.app",
  messagingSenderId: "868422289967",
  appId: "1:868422289967:web:eeebd0eeb4fe26b4ba94da"
};

// Initialize Firebase with a named app to avoid conflict with the default app
const app = initializeApp(firebaseConfig, 'qrApp');
export const db = getFirestore(app);
