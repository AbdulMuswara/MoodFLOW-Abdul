import admin from "firebase-admin";

try {
  // Load local service account for development
  const serviceAccount = require("../moodflow-key.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  // Fallback to Application Default Credentials in production (Cloud Run)
  console.log("Local service account not found, falling back to ADC...");
  try {
    admin.initializeApp({
      projectId: "moodflow-35f58"
    });
  } catch (adcError) {
    console.error("Failed to initialize Firebase Admin with ADC:", adcError);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();