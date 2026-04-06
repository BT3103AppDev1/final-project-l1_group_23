<template>
  <div>
    <RouterView />

    <!-- Global toast notifications -->
    <div class="toast-container">
      <div
        v-for="toast in notifStore.toasts"
        :key="toast.id"
        class="toast"
        @click="notifStore.removeToast(toast.id)"
      >
        🔔 {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { collection, onSnapshot } from 'firebase/firestore'
import { db, auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useNotificationsStore } from './stores/notifications'

export default {
  name: 'App',
  setup() {
    const notifStore = useNotificationsStore()
    return { notifStore }
  },
  data() {
    return {
      canteenUnsub: null,
      authUnsub: null,
      prevCrowdLevels: {}, // track previous crowd level per canteen
    }
  },
  mounted() {
    // Only start monitoring when user is logged in
    this.authUnsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        this.startMonitoring()
      } else {
        this.stopMonitoring()
      }
    })
  },
  beforeUnmount() {
    this.stopMonitoring()
    if (this.authUnsub) this.authUnsub()
  },
  methods: {
    startMonitoring() {
      this.canteenUnsub = onSnapshot(collection(db, 'canteens'), (snap) => {
        if (!this.notifStore.enabled) return

        snap.docs.forEach((docSnap) => {
          const canteen = docSnap.data()
          const id = docSnap.id
          const pct = canteen.totalSeats
            ? Math.round((canteen.occupiedSeats / canteen.totalSeats) * 100)
            : 0

          const prevLevel = this.prevCrowdLevels[id]
          const currLevel = pct >= 70 ? 'high' : pct >= 40 ? 'medium' : 'low'

          // Only trigger when transitioning INTO medium (not already medium/high)
          if (prevLevel && prevLevel !== 'medium' && currLevel === 'medium') {
            this.notifStore.addToast(`${canteen.name} has reached Medium crowd level (${pct}%)!`)
          }

          this.prevCrowdLevels[id] = currLevel
        })
      })
    },
    stopMonitoring() {
      if (this.canteenUnsub) {
        this.canteenUnsub()
        this.canteenUnsub = null
      }
    },
  },
}
</script>

<style>
.toast-container {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  background: #0a1c3e;
  color: white;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  max-width: 360px;
  animation: slideIn 0.3s ease;
}

.toast:hover {
  background: #162d56;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
