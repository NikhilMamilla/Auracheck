import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAmhms0W9_ENu0qin00G7MzF8_joqLpqPk",
  authDomain: "auracheck-f408f.firebaseapp.com",
  projectId: "auracheck-f408f",
  storageBucket: "auracheck-f408f.firebasestorage.app",
  messagingSenderId: "670711392230",
  appId: "1:670711392230:web:7e4c26fdc8e3e58a351827",
  measurementId: "G-KGEJHHPRR5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };