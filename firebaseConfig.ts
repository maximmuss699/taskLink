/**
 * @file firebaseConfig.ts
 * @author Maksim Samusevich (xsamus00)
 * @description firebase configuration file
 */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
    apiKey: "AIzaSyAkA41dS2MO7WWG4tKlOmN1GMEoKj59sAk",
    authDomain: "tasklink-4a1d5.firebaseapp.com",
    projectId: "tasklink-4a1d5",
    storageBucket: "tasklink-4a1d5.firebasestorage.app",
    messagingSenderId: "954364379029",
    appId: "1:954364379029:web:4650f1a0bef1c90b81c09c",
    measurementId: "G-8QYDHH8Y2F"
};

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);
const FIRESTORE = getFirestore(FIREBASE_APP);


export { FIREBASE_APP, FIRESTORE};