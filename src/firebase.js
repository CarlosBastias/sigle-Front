import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBpt-yCHY5xUtwoq9bFNDPUgLqVty7x320",
  authDomain: "sigle-rednorte.firebaseapp.com",
  projectId: "sigle-rednorte",
  storageBucket: "sigle-rednorte.firebasestorage.app",
  messagingSenderId: "551943021357",
  appId: "1:551943021357:web:88f09f1e86c65dbeaf69a4",
  measurementId: "G-QYPP8SDG16"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);