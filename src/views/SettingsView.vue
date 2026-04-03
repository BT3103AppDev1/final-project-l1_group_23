<template>
  <div class="settings-page">
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="brand-nus">NUS</span>
        <span class="brand-pulse">CanteenPulse</span>
      </div>

      <div class="navbar-links">
        <RouterLink to="/community" class="nav-link">
          <span class="nav-icon">⊞</span> Community
        </RouterLink>
        <RouterLink to="/map" class="nav-link"> <span class="nav-icon">⊕</span> Map </RouterLink>
        <RouterLink to="/recommended" class="nav-link">
          <span class="nav-icon">☆</span> Recommended
        </RouterLink>
        <RouterLink to="/favourites" class="nav-link">
          <span class="nav-icon">♡</span> Favourites
        </RouterLink>
        <RouterLink to="/rewards" class="nav-link">
          <span class="nav-icon">⚑</span> Rewards
        </RouterLink>
      </div>

      <div class="navbar-right">
        <RouterLink to="/settings" class="nav-link active icon-only">⚙</RouterLink>
        <button class="logout-btn" @click="handleLogout">↪ Logout</button>
      </div>
    </nav>

    <div class="settings-wrap">
      <div class="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences</p>
      </div>

      <div class="settings-card">
        <div class="section-title">Notifications</div>
        <div class="section-sub">Receive alerts when canteens get crowded</div>

        <div class="toggle-row">
          <div>
            <div class="toggle-label">Push Notifications</div>
            <div class="toggle-sub">Notify me when a canteen hits Medium crowd level</div>
          </div>

          <label class="switch">
            <input type="checkbox" v-model="notificationsEnabled" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-card dev-card">
        <div class="section-title dev-title">Developer Tools</div>
        <div class="section-sub">Simulate time-based events for testing</div>

        <div class="dev-actions">
          <button class="dev-btn reset" @click="simulateBusy" :disabled="working">
            Simulate 9:00 AM Reset (Randomise)
          </button>
          <button class="dev-btn clear" @click="simulateClear" :disabled="working">
            Simulate 9:00 PM Clear (Empty)
          </button>
        </div>

        <p v-if="message" class="message">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { db, auth } from '@/firebase'
import { collection, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { signOut } from 'firebase/auth'

const router = useRouter()
const working = ref(false)
const message = ref('')

const notificationsEnabled = ref(
  JSON.parse(localStorage.getItem('notificationsEnabled') || 'false'),
)

watch(notificationsEnabled, (value) => {
  localStorage.setItem('notificationsEnabled', JSON.stringify(value))
})

async function simulateBusy() {
  working.value = true
  message.value = ''

  try {
    const snap = await getDocs(collection(db, 'canteens'))

    for (const canteenDoc of snap.docs) {
      const data = canteenDoc.data()
      const max = data.maxCapacity ?? 100
      const randomOccupancy = Math.floor(max * (0.45 + Math.random() * 0.45))

      await updateDoc(doc(db, 'canteens', canteenDoc.id), {
        currentOccupancy: randomOccupancy,
        lastUpdated: Timestamp.now(),
      })
    }

    message.value = 'Canteen crowd levels updated with random busy values.'
  } catch (err) {
    console.error(err)
    message.value = 'Failed to simulate busy crowd data.'
  } finally {
    working.value = false
  }
}

async function simulateClear() {
  working.value = true
  message.value = ''

  try {
    const snap = await getDocs(collection(db, 'canteens'))

    for (const canteenDoc of snap.docs) {
      await updateDoc(doc(db, 'canteens', canteenDoc.id), {
        currentOccupancy: 0,
        lastUpdated: Timestamp.now(),
      })
    }

    message.value = 'All canteens cleared successfully.'
  } catch (err) {
    console.error(err)
    message.value = 'Failed to clear canteen crowd data.'
  } finally {
    working.value = false
  }
}

async function handleLogout() {
  await signOut(auth)
  router.push('/')
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.settings-page {
  min-height: 100vh;
  background: #f7f5ef;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.navbar {
  background: #1a4d8f;
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 50px;
}

.navbar-brand {
  font-size: 1rem;
  font-weight: 800;
  margin-right: 18px;
  flex-shrink: 0;
}

.brand-nus {
  color: #f97316;
}
.brand-pulse {
  color: #fff;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.nav-link {
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  font-size: 0.8rem;
  padding: 5px 11px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.nav-link.icon-only {
  padding: 5px 9px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.logout-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.76rem;
  padding: 4px 11px;
  border-radius: 6px;
  cursor: pointer;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.settings-wrap {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 20px 50px;
}

.settings-header h1 {
  margin: 0;
  color: #1d4f91;
  font-size: 2rem;
}

.settings-header p {
  margin: 6px 0 24px;
  color: #8a8f98;
}

.settings-card {
  background: white;
  border: 1px solid #ece7df;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 18px;
}

.section-title {
  font-weight: 700;
  color: #222;
  margin-bottom: 4px;
}

.section-sub {
  color: #9aa1ab;
  font-size: 0.9rem;
  margin-bottom: 18px;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.toggle-label {
  font-weight: 600;
  color: #222;
}

.toggle-sub {
  margin-top: 4px;
  color: #9aa1ab;
  font-size: 0.85rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  inset: 0;
  background-color: #d1d5db;
  border-radius: 999px;
  transition: 0.3s;
  cursor: pointer;
}

.slider::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  left: 3px;
  top: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}

.switch input:checked + .slider {
  background-color: #60a5fa;
}

.switch input:checked + .slider::before {
  transform: translateX(24px);
}

.dev-card {
  border-color: #f5d7cd;
}

.dev-title {
  color: #e8601e;
}

.dev-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.dev-btn {
  height: 42px;
  border-radius: 8px;
  border: 1px solid;
  background: white;
  font-weight: 600;
  cursor: pointer;
}

.dev-btn.reset {
  color: #2c6cbf;
  border-color: #8fb8e8;
}

.dev-btn.clear {
  color: #dc2626;
  border-color: #f1a2a2;
}

.dev-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  margin-top: 14px;
  color: #4b5563;
  font-size: 0.9rem;
}

@media (max-width: 700px) {
  .dev-actions {
    grid-template-columns: 1fr;
  }

  .toggle-row {
    align-items: flex-start;
  }
}
</style>
