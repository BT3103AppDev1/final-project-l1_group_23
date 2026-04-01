import { defineStore } from 'pinia'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, auth } from '@/firebase'

export const useRewardsStore = defineStore('rewards', {
  state: () => ({
    updateCount: 0,
    tier: 'Bronze',
    loading: true,
    unsubscribe: null,
  }),

  getters: {
    nextTier: (state) => {
      if (state.tier === 'Bronze') return 'Silver'
      if (state.tier === 'Silver') return 'Gold'
      if (state.tier === 'Gold') return 'Platinum'
      return null
    },
    updatesNeeded: (state) => {
      if (state.tier === 'Bronze') return 5 - state.updateCount
      if (state.tier === 'Silver') return 15 - state.updateCount
      if (state.tier === 'Gold') return 30 - state.updateCount
      return 0
    },
    progressPercent: (state) => {
      if (state.tier === 'Bronze') return Math.min((state.updateCount / 5) * 100, 100)
      if (state.tier === 'Silver') return Math.min(((state.updateCount - 5) / 10) * 100, 100)
      if (state.tier === 'Gold') return Math.min(((state.updateCount - 15) / 15) * 100, 100)
      return 100
    },
  },

  actions: {
    subscribe() {
      const user = auth.currentUser
      if (!user) return
      const userRef = doc(db, 'users', user.uid)
      this.unsubscribe = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          this.updateCount = data.updateCount ?? 0
          this.tier = data.tier ?? 'Bronze'
        }
        this.loading = false
      })
    },
    cleanup() {
      if (this.unsubscribe) this.unsubscribe()
    },
  },
})
