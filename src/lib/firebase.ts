import { initializeApp } from "firebase/app";
import { initializeAuth, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"],
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"],
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"],
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"],
  appId: import.meta.env["VITE_FIREBASE_APP_ID"],
};


const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
});
export const db = getFirestore(app);

// Initialize messaging for push notifications (lazy loaded in browser)
export const initializeMessaging = async () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // Dynamic import to avoid SSR issues
    const { getMessaging } = await import("firebase/messaging");
    return getMessaging(app);
  } catch (error) {
    console.error("Error initializing messaging:", error);
    return null;
  }
};

export default app;