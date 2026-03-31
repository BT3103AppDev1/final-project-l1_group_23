// ─── Firestore Seed Script ───────────────────────────────────────────────────
// Run once with: node seed.js
// This populates your Firestore 'canteens' collection with real NUS canteen data.
// Safe to re-run — it uses setDoc so it will just overwrite existing data.

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBspXqCBZB3D7Y0HjSfXJjXkKRKxpKGC2E',
  authDomain: 'canteenpulse.firebaseapp.com',
  projectId: 'canteenpulse',
  storageBucket: 'canteenpulse.firebasestorage.app',
  messagingSenderId: '1096238270668',
  appId: '1:1096238270668:web:28282a7f5177861fcada69',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// ─── IMAGE URLS ──────────────────────────────────────────────────────────────
// Replace each imageUrl with a real photo of the canteen.
// Use a direct image link (ending in .jpg / .png / .webp).
// Tip: find real NUS canteen photos on Google Images, right-click → Copy image address.
// The placeholder URLs below are food-court photos from Unsplash (free to use).
// ─────────────────────────────────────────────────────────────────────────────

const canteens = [
  {
    id: 'pgp-aircon',
    name: 'PGP Aircon Canteen',
    imageUrl: '/canteens/pgpairconcanteen.jpeg',
    totalSeats: 308,
    occupiedSeats: 0,
    operatingHours: { open: '07:00', close: '21:00' },
    stalls: [
      { name: 'Chicken Rice', open: true },
      { name: 'Western', open: true },
      { name: 'Mala Hotpot', open: true },
      { name: 'Vegetarian', open: true },
      { name: 'Drinks', open: true },
      { name: 'Fruits', open: true },
    ],
  },
  {
    id: 'frontier',
    name: 'Frontier',
    imageUrl: '/canteens/frontier.jpeg',
    totalSeats: 700,
    occupiedSeats: 0,
    operatingHours: { open: '07:00', close: '21:00' },
    stalls: [
      { name: 'Pasta', open: true },
      { name: 'Yong Tau Foo', open: true },
      { name: 'Indian', open: true },
      { name: 'Japanese', open: true },
      { name: 'Drinks', open: true },
    ],
  },
  {
    id: 'central-square-yih',
    name: 'Central Square @ YIH',
    imageUrl: '/canteens/centralsquareYIH.jpeg',
    totalSeats: 314,
    occupiedSeats: 0,
    operatingHours: { open: '07:30', close: '21:00' },
    stalls: [
      { name: 'Chicken Rice', open: true },
      { name: 'Noodles', open: true },
      { name: 'Western', open: true },
      { name: 'Drinks', open: true },
    ],
  },
  {
    id: 'fine-food-utown',
    name: 'Fine Food @ UTown',
    imageUrl: '/canteens/finefood.jpeg',
    totalSeats: 410,
    occupiedSeats: 0,
    operatingHours: { open: '07:00', close: '21:00' },
    stalls: [
      { name: 'Chicken Rice', open: true },
      { name: 'Mala Hotpot', open: true },
      { name: 'Western', open: true },
      { name: 'Vegetarian', open: true },
      { name: 'Drinks', open: true },
      { name: 'Fruits', open: true },
    ],
  },
  {
    id: 'the-deck',
    name: 'The Deck',
    imageUrl: '/canteens/thedeck.jpeg',
    totalSeats: 1015,
    occupiedSeats: 0,
    operatingHours: { open: '07:00', close: '21:00' },
    stalls: [
      { name: 'Noodles', open: true },
      { name: 'Indian', open: true },
      { name: 'Chicken Rice', open: true },
      { name: 'Western', open: true },
      { name: 'Drinks', open: true },
    ],
  },
  {
    id: 'flavours-utown',
    name: 'Flavours @ UTown',
    imageUrl: '/canteens/flavours.jpeg',
    totalSeats: 700,
    occupiedSeats: 0,
    operatingHours: { open: '07:00', close: '21:00' },
    stalls: [
      { name: 'Malay', open: true },
      { name: 'Chinese', open: true },
      { name: 'Western', open: true },
      { name: 'Drinks', open: true },
    ],
  },
]

async function seed() {
  console.log('🌱 Seeding Firestore canteens collection...\n')
  const now = Timestamp.now()

  for (const canteen of canteens) {
    const { id, ...data } = canteen
    await setDoc(doc(db, 'canteens', id), {
      ...data,
      lastUpdated: now,
      lastResetAt: now,
    })
    console.log(`✅  Added: ${data.name}`)
  }

  console.log('\n🎉 Done! All canteens seeded successfully.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
