import { defineStore } from 'pinia'
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { db, auth } from '@/firebase'

// Tier thresholds based on proposal (F-REQ-10)
function getTier(updateCount) {
  if (updateCount >= 30) return 'Platinum'
  if (updateCount >= 15) return 'Gold'
  if (updateCount >= 5) return 'Silver'
  return 'Bronze'
}

export const useCanteenStore = defineStore('canteen', {
  state: () => ({
    currentUserData: null, // { currentCheckInCanteenId, updateCount, tier, ... }
    loading: false,
    error: null,
  }),

  getters: {
    // Returns the canteen ID the user is currently checked into (or null)
    checkedInCanteenId: (state) => state.currentUserData?.currentCheckInCanteenId ?? null,
  },

  actions: {
    // ─── Load the current user's Firestore document ───────────────────────────
    async fetchCurrentUser() {
      const user = auth.currentUser
      if (!user) return

      const userRef = doc(db, 'users', user.uid)
      const snap = await getDoc(userRef)
      if (snap.exists()) {
        this.currentUserData = snap.data()
      }
    },

    // ─── F-REQ-04: Check In ───────────────────────────────────────────────────
    async checkIn(canteenId) {
      this.error = null
      this.loading = true

      try {
        const user = auth.currentUser
        if (!user) throw new Error('Not logged in')

        // Refresh user data first
        await this.fetchCurrentUser()

        // Block if already checked in somewhere (F-REQ-04 rule 4)
        if (this.currentUserData?.currentCheckInCanteenId) {
          this.error = 'You are already checked into a canteen. Please check out first.'
          return false
        }

        // Read canteen to check capacity (F-REQ-04 rule 3)
        const canteenRef = doc(db, 'canteens', canteenId)
        const canteenSnap = await getDoc(canteenRef)
        if (!canteenSnap.exists()) throw new Error('Canteen not found')

        const canteen = canteenSnap.data()
        if (canteen.occupiedSeats >= canteen.totalSeats) {
          this.error = 'Canteen is already full!'
          return false
        }

        const userRef = doc(db, 'users', user.uid)
        const newUpdateCount = (this.currentUserData?.updateCount ?? 0) + 1
        const newTier = getTier(newUpdateCount)

        // Atomically update canteen occupancy + user state (F-REQ-04 rules 1 & 2)
        await updateDoc(canteenRef, {
          occupiedSeats: increment(1),
          lastUpdated: serverTimestamp(),
        })

        await updateDoc(userRef, {
          currentCheckInCanteenId: canteenId,
          updateCount: newUpdateCount,
          tier: newTier,
        })

        // Log the check-in event in the checkins collection
        await addDoc(collection(db, 'checkins'), {
          userId: user.uid,
          canteenId,
          type: 'checkin',
          timestamp: serverTimestamp(),
        })

        // Update local state
        this.currentUserData = {
          ...this.currentUserData,
          currentCheckInCanteenId: canteenId,
          updateCount: newUpdateCount,
          tier: newTier,
        }

        return true
      } catch (err) {
        this.error = err.message || 'Check-in failed. Please try again.'
        return false
      } finally {
        this.loading = false
      }
    },

    // ─── F-REQ-05: Check Out ──────────────────────────────────────────────────
    async checkOut(canteenId) {
      this.error = null
      this.loading = true

      try {
        const user = auth.currentUser
        if (!user) throw new Error('Not logged in')

        const canteenRef = doc(db, 'canteens', canteenId)
        const userRef = doc(db, 'users', user.uid)

        // Decrement occupiedSeats (never go below 0)
        const canteenSnap = await getDoc(canteenRef)
        if (!canteenSnap.exists()) throw new Error('Canteen not found')
        const currentOccupied = canteenSnap.data().occupiedSeats ?? 0

        await updateDoc(canteenRef, {
          occupiedSeats: currentOccupied > 0 ? increment(-1) : 0,
          lastUpdated: serverTimestamp(),
        })

        await updateDoc(userRef, {
          currentCheckInCanteenId: null,
        })

        // Log the check-out event
        await addDoc(collection(db, 'checkins'), {
          userId: user.uid,
          canteenId,
          type: 'checkout',
          timestamp: serverTimestamp(),
        })

        // Update local state
        this.currentUserData = {
          ...this.currentUserData,
          currentCheckInCanteenId: null,
        }

        return true
      } catch (err) {
        this.error = err.message || 'Check-out failed. Please try again.'
        return false
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },
  },
})
