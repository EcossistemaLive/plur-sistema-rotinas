import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

// Firebase configuration — using .env.local for local dev, hardcoded for production build
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDpzXl0CXHNigHrRSEOUxTXlTmhkN7YqGI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rotinas-plur.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rotinas-plur",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rotinas-plur.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "838855542344",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:838855542344:web:5752e9220c1a01f4e63a7d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// --- Database Utilities ---

export const addTask = async (taskData) => {
  try {
    await addDoc(collection(db, 'tasks'), {
      ...taskData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId, newStatus) => {
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

export const addEvent = async (eventData) => {
  try {
    await addDoc(collection(db, 'events'), {
      ...eventData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
};
