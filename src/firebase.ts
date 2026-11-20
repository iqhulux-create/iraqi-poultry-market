import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const DEFAULT_RTDB_URL =
  'https://iraqipoultrymarket-default-rtdb.europe-west1.firebasedatabase.app';

const rawEnvDatabaseUrl =
  typeof import.meta !== 'undefined' &&
  (import.meta as { env?: Record<string, string> }).env?.VITE_FIREBASE_DATABASE_URL;

const normalizedDatabaseUrl = (rawEnvDatabaseUrl || DEFAULT_RTDB_URL)
  .trim()
  .replace(/\/+$/, '');

export const FIREBASE_POSTS_PATH = 'posts' as const;

export const firebaseConfig = {
  apiKey: 'AIzaSyDmv0d6Bgk6gD8ZVOtXtmqY2k6akt18vyc',
  authDomain: 'iraqipoultrymarket.firebaseapp.com',
  projectId: 'iraqipoultrymarket',
  storageBucket: 'iraqipoultrymarket.firebasestorage.app',
  messagingSenderId: '818667799166',
  appId: '1:818667799166:web:17cd20c9f761bac22f8e2f',
  measurementId: 'G-1EGLG18REZ',
  databaseURL: normalizedDatabaseUrl,
};

export const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const rtdb = getDatabase(firebaseApp, firebaseConfig.databaseURL);
