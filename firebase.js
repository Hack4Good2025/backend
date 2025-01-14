// Import the necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase with error handling
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase app:", error);
}

// Initialize Firestore
const db = app ? getFirestore(app) : null;

// Function to get the Firebase app
const getFirebaseApp = () => {
  if (!app) {
    throw new Error("Firebase app is not initialized");
  }
  return app;
};

// Export the Firestore database and getFirebaseApp function for use in other files
export { db, getFirebaseApp };
