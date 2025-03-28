// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAmhms0W9_ENu0qin00G7MzF8_joqLpqPk",
  authDomain: "auracheck-f408f.firebaseapp.com",
  projectId: "auracheck-f408f",
  storageBucket: "auracheck-f408f.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "670711392230",
  appId: "1:670711392230:web:7e4c26fdc8e3e58a351827",
  measurementId: "G-KGEJHHPRR5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
