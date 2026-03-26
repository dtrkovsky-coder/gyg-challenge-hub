import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ============================================================
// PASTE YOUR FIREBASE CONFIG HERE (from Firebase Console)
// Project Settings > Your apps > Web app config
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyAoG1ZuZ_ldJM6wIK5ioSL1T1lC1qDWIUk",
  authDomain: "gyg-challenge-hub.firebaseapp.com",
  projectId: "gyg-challenge-hub",
  storageBucket: "gyg-challenge-hub.firebasestorage.app",
  messagingSenderId: "207338432558",
  appId: "1:207338432558:web:3eb4bfa2ca74a94d2357bf"
};
// ============================================================

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
