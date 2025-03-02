/**
 * @file firebaseConfig.ts
 * @author Maksim Samusevich (xsamus00)
 * @description firebase configuration file
 */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
    apiKey: "", // key is obsolete
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);
const FIRESTORE = getFirestore(FIREBASE_APP);


export { FIREBASE_APP, FIRESTORE};
