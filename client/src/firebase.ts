import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ NEW

const firebaseConfig = {
  apiKey: "AIzaSyD_gGGZIpkYrYi71GNtDuz9RhrYbrTvGss",
  authDomain: "urbanflow-e0a40.firebaseapp.com",
  projectId: "urbanflow-e0a40",
  storageBucket: "urbanflow-e0a40.firebasestorage.app",
  messagingSenderId: "1020292818528",
  appId: "1:1020292818528:web:36c03405dc00401a944505"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
