<template>
  <div class="canteen-page">

    <!-- Header banner -->
    <div class="canteen-banner">
      <div class="banner-overlay">
        <div class="canteen-meta">
          <span class="status-badge" :class="isOpen ? 'open' : 'closed'">
            {{ isOpen ? 'OPEN NOW' : 'CLOSED' }}
          </span>
          <span class="campus-tag">🎓 NUS Campus</span>
        </div>
        <h1 class="canteen-name">{{ canteen?.name ?? 'Loading...' }}</h1>
      </div>
    </div>

    <div class="content-grid">
      <!-- Left: Crowd status + check-in/out -->
      <div class="left-col">

        <!-- Live Crowd Status card (F-REQ-03) -->
        <div class="card crowd-card">
          <div class="card-header">
            <span class="live-dot"></span>
            <span class="card-title">Live Crowd Status</span>
            <span class="updated-label">Updated just now</span>
          </div>

          <div v-if="canteen" class="crowd-body">
            <div class="occupancy-number" :class="crowdClass">
              {{ occupancyPercent }}%
              <span class="occupied-label">Occupied</span>
            </div>

            <div class="crowd-label" :class="crowdClass">
              ● {{ crowdLabel }} ({{ occupancyPercent }}%)
            </div>

            <!-- Progress bar -->
            <div class="progress-bar-bg">
              <div
                class="progress-bar-fill"
                :class="crowdClass"
                :style="{ width: occupancyPercent + '%' }"
              ></div>
            </div>

            <div class="seat-count">
              {{ canteen.occupiedSeats }} / {{ canteen.totalSeats }} seats occupied
            </div>
          </div>
          <div v-else class="loading-text">Loading crowd data...</div>

          <!-- Error / success messages -->
          <p v-if="store.error" class="msg error">⚠ {{ store.error }}</p>
          <p v-if="successMessage" class="msg success">✓ {{ successMessage }}</p>

          <!-- Check-In / Check-Out buttons (F-REQ-04, F-REQ-05) -->
          <div class="action-buttons">
            <button
              class="btn-checkin"
              :disabled="store.loading || isCheckedInHere || canteen?.occupiedSeats >= canteen?.totalSeats"
              @click="handleCheckIn"
            >
              {{ store.loading && !isCheckedInHere ? 'Checking in...' : "I'm Sitting Down" }}
            </button>

            <button
              class="btn-checkout"
              :disabled="store.loading || !isCheckedInHere"
              @click="handleCheckOut"
            >
              {{ store.loading && isCheckedInHere ? 'Checking out...' : "I'm Leaving" }}
            </button>
          </div>

          <!-- Contextual hint text -->
          <p v-if="isCheckedInHere" class="hint">You are currently checked in here.</p>
          <p v-else-if="store.checkedInCanteenId && !isCheckedInHere" class="hint warn">
            You are checked into another canteen. Check out there first.
          </p>
          <p v-else-if="canteen?.occupiedSeats >= canteen?.totalSeats" class="hint warn">
            Canteen is full! Try another canteen.
          </p>
        </div>

        <!-- Food Stalls list -->
        <div class="card stalls-card" v-if="canteen?.stalls?.length">
          <h3 class="stalls-title">Food Stalls</h3>
          <div class="stalls-grid">
            <div class="stall-item" v-for="stall in canteen.stalls" :key="stall.name">
              <span class="stall-initial">{{ stall.name[0] }}</span>
              <span class="stall-name">{{ stall.name }}</span>
              <span class="stall-status" :class="stall.open ? 'open' : 'closed'">
                {{ stall.open ? 'OPEN' : 'CLOSED' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Operating hours -->
      <div class="right-col">
        <div class="card hours-card" v-if="canteen?.operatingHours">
          <h3 class="hours-title">Operating Hours</h3>
          <div class="hours-row">
            <span>Mon – Fri</span>
            <span class="hours-time open">
              {{ canteen.operatingHours.open }} – {{ canteen.operatingHours.close }}
            </span>
          </div>
          <div class="hours-row">
            <span>Sat</span>
            <span class="hours-time open">8:00 AM – 3:00 PM</span>
          </div>
          <div class="hours-row">
            <span>Sun</span>
            <span class="hours-time closed">Closed</span>
          </div>
          <div class="peak-hours">
            <span>Peak Hours</span>
            <span class="hours-time warn">12:00 PM – 2:00 PM</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Back button -->
    <div class="back-row">
      <button class="btn-back" @click="$router.push('/community')">← Back to Community</button>
    </div>
  </div>
</template>

<script>
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { useCanteenStore } from '@/stores/canteen'

export default {
  name: 'CanteenView',

  props: {
    id: {
      type: String,
      required: true,
    },
  },

  setup() {
    const store = useCanteenStore()
    return { store }
  },

  data() {
    return {
      canteen: null,
      unsubscribe: null,   // Firestore real-time listener cleanup
      successMessage: '',
      successTimeout: null,
    }
  },

  computed: {
    // Occupancy percentage (0–100)
    occupancyPercent() {
      if (!this.canteen) return 0
      const { occupiedSeats, totalSeats } = this.canteen
      if (!totalSeats) return 0
      return Math.min(Math.round((occupiedSeats / totalSeats) * 100), 100)
    },

    // CSS class based on crowd level (F-REQ-03)
    crowdClass() {
      if (this.occupancyPercent >= 70) return 'high'
      if (this.occupancyPercent >= 40) return 'medium'
      return 'low'
    },

    // Human-readable crowd label
    crowdLabel() {
      if (this.occupancyPercent >= 70) return 'High Crowd'
      if (this.occupancyPercent >= 40) return 'Medium Crowd'
      return 'Low Crowd'
    },

    // Whether the canteen is currently open
    isOpen() {
      if (!this.canteen?.operatingHours) return false
      const now = new Date()
      const [openH, openM] = this.canteen.operatingHours.open.split(':').map(Number)
      const [closeH, closeM] = this.canteen.operatingHours.close.split(':').map(Number)
      const openMinutes = openH * 60 + openM
      const closeMinutes = closeH * 60 + closeM
      const nowMinutes = now.getHours() * 60 + now.getMinutes()
      return nowMinutes >= openMinutes && nowMinutes < closeMinutes
    },

    // Whether this user is checked in specifically here
    isCheckedInHere() {
      return this.store.checkedInCanteenId === this.id
    },
  },

  async created() {
    // Load user state and subscribe to live canteen updates
    await this.store.fetchCurrentUser()
    this.subscribeToCanteen()
  },

  beforeUnmount() {
    if (this.unsubscribe) this.unsubscribe()
    if (this.successTimeout) clearTimeout(this.successTimeout)
  },

  methods: {
    // Real-time listener on the canteen document (F-REQ-03)
    subscribeToCanteen() {
      const canteenRef = doc(db, 'canteens', this.id)
      this.unsubscribe = onSnapshot(canteenRef, (snap) => {
        if (snap.exists()) {
          this.canteen = { id: snap.id, ...snap.data() }
        }
      })
    },

    // F-REQ-04: Handle check-in
    async handleCheckIn() {
      this.store.clearError()
      this.successMessage = ''
      const success = await this.store.checkIn(this.id)
      if (success) {
        this.showSuccess('Successfully checked in! Enjoy your meal 🍽')
      }
    },

    // F-REQ-05: Handle check-out
    async handleCheckOut() {
      this.store.clearError()
      this.successMessage = ''
      const success = await this.store.checkOut(this.id)
      if (success) {
        this.showSuccess('Successfully checked out! See you next time 👋')
      }
    },

    showSuccess(msg) {
      this.successMessage = msg
      this.successTimeout = setTimeout(() => {
        this.successMessage = ''
      }, 4000)
    },
  },
}
</script>

<style scoped>
.canteen-page {
  min-height: 100vh;
  background: #f0f2f5;
  font-family: Arial, sans-serif;
}

/* ── Banner ── */
.canteen-banner {
  height: 200px;
  background: linear-gradient(135deg, #1e3a6e 0%, #2d5299 100%);
  position: relative;
}

.banner-overlay {
  position: absolute;
  bottom: 24px;
  left: 32px;
}

.canteen-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
}
.status-badge.open { background: #22c55e; color: white; }
.status-badge.closed { background: #ef4444; color: white; }

.campus-tag {
  color: rgba(255,255,255,0.85);
  font-size: 0.9rem;
}

.canteen-name {
  color: white;
  font-size: 2.2rem;
  font-weight: 900;
}

/* ── Content grid ── */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 24px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 20px;
}

/* ── Crowd card ── */
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.live-dot {
  width: 10px;
  height: 10px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.card-title {
  font-weight: 700;
  font-size: 1rem;
  color: #333;
}

.updated-label {
  margin-left: auto;
  font-size: 0.8rem;
  color: #999;
}

.occupancy-number {
  font-size: 3rem;
  font-weight: 900;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.occupied-label {
  font-size: 1rem;
  font-weight: normal;
  color: #666;
}

.crowd-label {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 6px 0 12px;
}

/* Crowd colour classes (F-REQ-03) */
.low    { color: #22c55e; }
.medium { color: #f97316; }
.high   { color: #ef4444; }

.progress-bar-bg {
  background: #e5e7eb;
  border-radius: 999px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}
.progress-bar-fill.low    { background: #22c55e; }
.progress-bar-fill.medium { background: #f97316; }
.progress-bar-fill.high   { background: #ef4444; }

.seat-count {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 16px;
}

.msg {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 12px;
}
.msg.error   { background: #fee2e2; color: #b91c1c; }
.msg.success { background: #dcfce7; color: #15803d; }

/* ── Action buttons ── */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.btn-checkin,
.btn-checkout {
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: background 0.2s, opacity 0.2s;
}

.btn-checkin {
  background: #e87722;
  color: white;
}
.btn-checkin:hover:not(:disabled) { background: #d4681a; }

.btn-checkout {
  background: #1e3a6e;
  color: white;
}
.btn-checkout:hover:not(:disabled) { background: #162d56; }

.btn-checkin:disabled,
.btn-checkout:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.hint {
  font-size: 0.82rem;
  color: #666;
  margin-top: 10px;
  text-align: center;
}
.hint.warn { color: #f97316; }

/* ── Stalls ── */
.stalls-title,
.hours-title {
  font-size: 1rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
}

.stalls-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stall-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 8px;
}

.stall-initial {
  width: 30px;
  height: 30px;
  background: #1e3a6e;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.stall-name {
  font-size: 0.9rem;
  color: #333;
  flex: 1;
}

.stall-status {
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 20px;
}
.stall-status.open   { background: #dcfce7; color: #15803d; }
.stall-status.closed { background: #fee2e2; color: #b91c1c; }

/* ── Operating hours ── */
.hours-row,
.peak-hours {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.9rem;
  color: #555;
}

.peak-hours {
  border-bottom: none;
  margin-top: 4px;
  font-weight: 600;
}

.hours-time.open   { color: #22c55e; font-weight: 600; }
.hours-time.closed { color: #ef4444; font-weight: 600; }
.hours-time.warn   { color: #f97316; font-weight: 600; }

/* ── Back button ── */
.back-row {
  max-width: 1100px;
  margin: 0 auto 40px;
  padding: 0 24px;
}

.btn-back {
  background: none;
  border: 1px solid #ccc;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  color: #555;
  font-size: 0.9rem;
}
.btn-back:hover { background: #f3f4f6; }

.loading-text {
  color: #999;
  font-size: 0.9rem;
  padding: 12px 0;
}
</style>