import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyC6k0lhOOY3cbeKQBp4i-FPpOOnlGC_62U",
  authDomain: "exchangehube-65d54.firebaseapp.com",
  projectId: "exchangehube-65d54",
  storageBucket: "exchangehube-65d54.firebasestorage.app",
  messagingSenderId: "331583171441",
  appId: "1:331583171441:web:0f269370698a7454cf24d0",
  measurementId: "G-Y469PYRL8V"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
export const storage = getStorage(app);
