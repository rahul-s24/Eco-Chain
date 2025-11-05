import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDmMtgGBEeEifa1baAVnUN_Hk459QYKmIA",
  authDomain: "ecochain-8795a.firebaseapp.com",
  projectId: "ecochain-8795a",
  storageBucket: "ecochain-8795a.firebasestorage.app",
  messagingSenderId: "232880557847",
  appId: "1:232880557847:web:0737ebfc9ee1645c98b152",
  measurementId: "G-SXNL7T2HX0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);