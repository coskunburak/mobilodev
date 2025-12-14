import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBC4XHefn-igKfYJlB9d4vdqxcIYNeXmEM",
  authDomain: "focus-app-tracker-78401.firebaseapp.com",
  projectId: "focus-app-tracker-78401",
  storageBucket: "focus-app-tracker-78401.firebasestorage.app",
  messagingSenderId: "283706552868",
  appId: "1:283706552868:web:e156724415edd11732deb1",
  measurementId: "G-LV934Q5CZL"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});