import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBspXqCBZB3D7Y0HjSfXJjXkKRKxpKGC2E',
  authDomain: 'canteenpulse.firebaseapp.com',
  projectId: 'canteenpulse',
  storageBucket: 'canteenpulse.firebasestorage.app',
  messagingSenderId: '1096238270668',
  appId: '1:1096238270668:web:28282a7f5177861fcada69',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
