// src/lib/firebase-config.js
// Reads from NEXT_PUBLIC_ env vars so creds stay out of source control.
// For local dev, copy .env.example to .env.local and fill in your values.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAW0QMBgmGzFivEWOMNla66ff3AX8XZJqg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "echo-gaze.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "echo-gaze",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "echo-gaze.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "337771759203",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:337771759203:web:6740bbe487d24e468e9a56",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-TS6FC11W3R",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://echo-gaze-default-rtdb.firebaseio.com",
};
