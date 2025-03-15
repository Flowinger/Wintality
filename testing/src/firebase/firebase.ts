import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBJBe7ahcXerFeopQVMCViZer2u_fX8ui0",
  authDomain: "athlete-testing.firebaseapp.com",
  projectId: "athlete-testing",
  storageBucket: "athlete-testing.firebasestorage.app",
  messagingSenderId: "689885275284",
  appId: "1:689885275284:web:9c194b00e6cdcf64d70081",
  measurementId: "G-46P8EL1YEG"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export { app };
export const db = getFirestore(app);
export const functions = getFunctions(app);
