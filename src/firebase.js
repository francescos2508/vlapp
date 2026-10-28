/* // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6pYSd3lOiGl5ktiBFIMLF6hfkIRI53Do",
  authDomain: "xsplit-0.firebaseapp.com",
  projectId: "xsplit-0",
  storageBucket: "xsplit-0.firebasestorage.app",
  messagingSenderId: "898483249475",
  appId: "1:898483249475:web:f7da868cda73f8e2964ff6",
  measurementId: "G-PYHWDSS0FV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Auth e Firestore to use in the whole app
export const auth = getAuth(app);
export const db = getFirestore(app);


 */



// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyB6pYSd3lOiGl5ktiBFIMLF6hfkIRI53Do",
  authDomain: "xsplit-0.firebaseapp.com",
  projectId: "xsplit-0",
  storageBucket: "xsplit-0.firebasestorage.app",
  // storageBucket: "TUO_BUCKET.appspot.com",
  messagingSenderId: "898483249475",
  appId: "1:898483249475:web:f7da868cda73f8e2964ff6",
  measurementId: "G-PYHWDSS0FV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// // if local use emulator
// if (window.location.hostname === "localhost" || window.location.hostname.includes('192.168.0.')) {
//   console.log("Using Firestore Emulator");
//   connectFirestoreEmulator(db, "localhost", 8080);
// }


export { db, auth };
