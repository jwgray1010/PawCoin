import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC2uuzW8wNz91BLFhIrUcAEnV9qtAX8XEY',
  authDomain: 'project-1067802872852.firebaseapp.com',
  projectId: 'project-1067802872852',
  storageBucket: 'project-1067802872852.appspot.com',
  messagingSenderId: '1067802872852',
  appId: '1:1067802872852:ios:db402623874dc3123feb01',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Save anchor for a specific user
export async function saveAnchorForUser(uid, anchor) {
  const anchorId = anchor.id;
  await setDoc(doc(db, 'users', uid, 'anchors', anchorId), anchor);
}

// Load all anchors for a specific user
export async function loadAnchorsForUser(uid) {
  const snapshot = await getDocs(collection(db, 'users', uid, 'anchors'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

