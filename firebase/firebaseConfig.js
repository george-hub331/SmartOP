// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyATHESX51ZHV10_Vv-7_08o2zzho9fiN7I",
  authDomain: "smartop-f2a94.firebaseapp.com",
  projectId: "smartop-f2a94",
  storageBucket: "smartop-f2a94.appspot.com",
  messagingSenderId: "382333928279",
  appId: "1:382333928279:web:54c57aabc9f33cd889b412",
  measurementId: "G-TH2P59GKGZ",
  databaseURL: "https://DATABASE_NAME.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getDatabase(app);

const auth = getAuth();

export { app, db, auth };
