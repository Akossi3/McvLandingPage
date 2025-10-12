// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, updateDoc, doc, arrayUnion, arrayRemove, onSnapshot, serverTimestamp, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZhaajPCrwk4_C74iZB6T-470P9bjJBVc",
  authDomain: "mcvlanding.firebaseapp.com",
  projectId: "mcvlanding",
  storageBucket: "mcvlanding.firebasestorage.app",
  messagingSenderId: "389951483515",
  appId: "1:389951483515:web:204144b04332f9363e3cde"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, collection, addDoc, getDocs, query, orderBy, updateDoc, doc, arrayUnion, arrayRemove, onSnapshot, serverTimestamp, where };
