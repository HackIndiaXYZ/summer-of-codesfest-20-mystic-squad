// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { firebaseConfig } from "./firebase-config";

let app;

if (typeof window !== "undefined" && !getApps().length) {
  app = initializeApp(firebaseConfig);
} else if (getApps().length) {
  app = getApp();
}

export const auth = app ? getAuth(app) : null;
export const database = app ? getDatabase(app) : null;
