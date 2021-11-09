// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANgY0lwuIr8HrE0ZvTzS-0gx-oI6Uk8mw",
  authDomain: "anan6254.firebaseapp.com",
  databaseURL: "https://anan6254-default-rtdb.firebaseio.com",
  projectId: "anan6254",
  storageBucket: "anan6254.appspot.com",
  messagingSenderId: "477177981751",
  appId: "1:477177981751:web:58f745e540f91c073ec8b2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default ({app});