import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlnnsb37gT-lELLnfjVFU2MviDiuiGmxs",
  authDomain: "assistant-b1b2c.firebaseapp.com",
  projectId: "assistant-b1b2c",
  storageBucket: "assistant-b1b2c.appspot.com",
  messagingSenderId: "603913047823",
  appId: "1:603913047823:web:a9368f7c2f7d1d01b6f87a",
  measurementId: "G-QLZS7EHE6P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Initialize Auth
const auth = getAuth(app);

export { db, storage, auth }; 