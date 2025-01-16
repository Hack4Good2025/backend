import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a require function for importing CommonJS modules
const require = createRequire(import.meta.url);

// Use require to import the service account JSON
const serviceAccount = require('./firebaseServiceAccountKey.json');

try {
  // Initialize Firebase Admin SDK
  initializeApp({
    credential: cert(serviceAccount),
  });
  console.log("Firebase Admin initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase Admin:", error);
}

const db = getFirestore();

const getFirebaseAdminApp = () => {
  if (!admin.apps.length) {
    throw new Error("Firebase Admin app is not initialized");
  }
  return admin;
};

export { db, getFirebaseAdminApp };
