// client/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Basic validation to help catch common setup mistakes
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
  // eslint-disable-next-line no-console
  console.error("Missing NEXT_PUBLIC_FIREBASE_API_KEY. Set it in client/.env.local using your Firebase Web App config.");
}
if (!firebaseConfig.authDomain) {
  // eslint-disable-next-line no-console
  console.error("Missing NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN. Set it in client/.env.local (e.g., your-project.firebaseapp.com).");
}
if (!firebaseConfig.projectId) {
  // eslint-disable-next-line no-console
  console.error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID. Set it in client/.env.local.");
}

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
export default app;
