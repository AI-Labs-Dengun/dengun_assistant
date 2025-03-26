import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlnnsb37gT-lELLnfjVFU2MviDiuiGmxs",
  authDomain: "assistant-b1b2c.firebaseapp.com",
  projectId: "assistant-b1b2c",
  storageBucket: "assistant-b1b2c.firebasestorage.app",
  messagingSenderId: "603913047823",
  appId: "1:603913047823:web:a9368f7c2f7d1d01b6f87a",
  measurementId: "G-QLZS7EHE6P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 