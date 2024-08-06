import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectDatabaseEmulator, getDatabase } from 'firebase/database';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-config.json';

const firebaseApp = initializeApp(firebaseConfig);

// To enable emulator, set `"useEmulator": true ` in firebase-config.json
const useEmulator = (firebaseConfig as any)['useEmulator'] == true;

// used for the firestore refs
export const firestore = getFirestore(firebaseApp);
if (useEmulator) connectFirestoreEmulator(firestore, '127.0.0.1', 8080);

export const firebaseAuth = getAuth();
if (useEmulator) connectAuthEmulator(firebaseAuth, 'http://127.0.0.1:9099');

export const database = getDatabase(firebaseApp);
if (useEmulator) connectDatabaseEmulator(database, '127.0.0.1', 9000);

// Functions
// const functions = getFunctions(firebaseApp, firebaseConfig.region);
// if (useEmulator) connectFunctionsEmulator(functions, '127.0.0.1', 5001);
