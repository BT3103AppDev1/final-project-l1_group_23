<template>
  <div class="page-wrapper">
    <header>
      <div class="logo-section">
        <span class="logo-nus">NUS</span><span class="logo-text">CanteenPulse</span>
      </div>
      <nav class="nav-links">
        <RouterLink to="/community" active-class="active">🏠 Community</RouterLink>
        <RouterLink to="/map" active-class="active">🗺 Map</RouterLink>
        <RouterLink to="/recommended" active-class="active">⭐ Recommended</RouterLink>
        <RouterLink to="/favourites" active-class="active">♡ Favourites</RouterLink>
        <RouterLink to="/rewards" active-class="active">🎁 Rewards</RouterLink>
        <RouterLink to="/settings" active-class="active">⚙️ Settings</RouterLink>
      </nav>
      <div class="user-controls">
        <button class="logout-btn" @click="logout">↪ Logout</button>
      </div>
    </header>

    <main>
      <div class="settings-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your account preferences</p>
      </div>

      <div class="settings-card">
        <div class="card-title">🔔 Notifications</div>
        <div class="card-sub">Receive alerts when canteens get crowded</div>
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
        <p v-if="notificationsEnabled" class="hint success">
          You will be alerted when any canteen reaches Medium occupancy.
        </p>
      </div>

      <div class="settings-card dev-card">
        <div class="card-title dev-title">🛠 Developer Tools</div>
        <div class="card-sub">Simulate time-based events for testing</div>
        <div class="dev-actions">
          <button class="dev-btn reset" @click="simulateBusy" :disabled="working">
            Simulate 9:00 AM Reset (Randomise)
          </button>
          <button class="dev-btn clear" @click="simulateClear" :disabled="working">
            Simulate 9:00 PM Clear (Empty)
          </button>
        </div>
        <div v-if="working" class="dev-loading">
          <div class="spinner"></div>
          <span>Updating Firestore...</span>
        </div>
        <p v-if="message" class="hint" :class="messageType">{{ message }}</p>
      </div>
    </main>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router'
import { db, auth } from '@/firebase'
import { collection, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useNotificationsStore } from '@/stores/notifications'

export default {
  name: 'SettingsView',
  components: { RouterLink },

  setup() {
    const notifStore = useNotificationsStore()
    return { notifStore }
  },

  computed: {
    notificationsEnabled: {
      get() {
        return this.notifStore.enabled
      },
      set(value) {
        this.notifStore.setEnabled(value)
      },
    },
  },

  data() {
    return {
      working: false,
      message: '',
      messageType: 'success',
    }
  },

  methods: {
    async simulateBusy() {
      this.working = true
      this.message = ''
      try {
        const snap = await getDocs(collection(db, 'canteens'))
        for (const canteenDoc of snap.docs) {
          const data = canteenDoc.data()
          const max = data.totalSeats ?? 100
          const randomOccupancy = Math.floor(max * (0.45 + Math.random() * 0.45))
          await updateDoc(doc(db, 'canteens', canteenDoc.id), {
            occupiedSeats: randomOccupancy,
            lastUpdated: Timestamp.now(),
          })
        }
        this.messageType = 'success'
        this.message = 'Canteen crowd levels updated with random busy values.'
      } catch (err) {
        console.error(err)
        this.messageType = 'error'
        this.message = 'Failed to simulate busy crowd data.'
      } finally {
        this.working = false
      }
    },

    async simulateClear() {
      this.working = true
      this.message = ''
      try {
        const snap = await getDocs(collection(db, 'canteens'))
        for (const canteenDoc of snap.docs) {
          await updateDoc(doc(db, 'canteens', canteenDoc.id), {
            occupiedSeats: 0,
            lastUpdated: Timestamp.now(),
          })
        }
        this.messageType = 'success'
        this.message = 'All canteens cleared successfully.'
      } catch (err) {
        console.error(err)
        this.messageType = 'error'
        this.message = 'Failed to clear canteen crowd data.'
      } finally {
        this.working = false
      }
    },

    async logout() {
      await signOut(auth)
      this.$router.push({ name: 'Landing' })
    },
  },
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.page-wrapper {
  min-height: 100vh;
  background: linear-gradient(160deg, #fef3e8 0%, #fde8d8 50%, #f0e8f8 100%);
  font-family: Arial, sans-serif;
}

header {
  background-color: #0a1c3e;
  padding: 12px 40px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 2px;
}

.logo-nus {
  color: #f37021;
  font-weight: 800;
  font-size: 1.2rem;
}

.logo-text {
  font-weight: 700;
  font-size: 1.2rem;
  color: white;
}

.nav-links {
  display: flex;
  gap: 6px;
  align-items: center;
}
.nav-links a {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-size: 14px;
  padding: 6px 14px;
  border-radius: 20px;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  line-height: 1;
}
.nav-links a span,
.nav-links a {
  vertical-align: middle;
}
.nav-links a:hover,
.nav-links a.active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

.user-controls {
  display: flex;
  align-items: center;
}

.logout-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 6px;
  transition: 0.2s;
}

.logout-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.12);
}

main {
  max-width: 760px;
  margin: 0 auto;
  padding: 36px 24px 60px;
}

.settings-header {
  margin-bottom: 28px;
}

.settings-header h1 {
  font-size: 2rem;
  font-weight: 900;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.settings-header p {
  color: #8a8f98;
  font-size: 0.9rem;
}

.settings-card {
  background: white;
  border: 1px solid #ece7df;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-weight: 700;
  color: #222;
  margin-bottom: 4px;
}

.card-sub {
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
  flex-shrink: 0;
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
  font-size: 0.83rem;
  transition: background 0.14s;
}

.dev-btn.reset {
  color: #2c6cbf;
  border-color: #8fb8e8;
}

.dev-btn.reset:hover:not(:disabled) {
  background: #eff6ff;
}

.dev-btn.clear {
  color: #dc2626;
  border-color: #f1a2a2;
}

.dev-btn.clear:hover:not(:disabled) {
  background: #fef2f2;
}

.dev-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dev-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  color: #888;
  font-size: 0.9rem;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #e5e7eb;
  border-top-color: #e8601e;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.hint {
  margin-top: 14px;
  font-size: 0.9rem;
  padding: 8px 12px;
  border-radius: 8px;
}

.hint.success {
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.hint.error {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fca5a5;
}

@media (max-width: 700px) {
  .dev-actions {
    grid-template-columns: 1fr;
  }
  .toggle-row {
    align-items: flex-start;
  }
  .nav-links {
    display: none;
  }
}
</style>
