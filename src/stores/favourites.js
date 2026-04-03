import { defineStore } from 'pinia'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db, auth } from '@/firebase'

export const useFavouritesStore = defineStore('favourites', {
  state: () => ({
    favourites: [], // array of canteen IDs
    loaded: false,
  }),

  actions: {
    // Call once after login to hydrate from Firestore
    async load() {
      const user = auth.currentUser
      if (!user) return
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists()) {
        this.favourites = snap.data().favourites ?? []
      }
      this.loaded = true
    },

    async toggle(id) {
      const user = auth.currentUser
      const isFav = this.favourites.includes(id)

      // Optimistic local update first (instant UI response)
      if (isFav) {
        this.favourites = this.favourites.filter((f) => f !== id)
      } else {
        this.favourites.push(id)
      }

      // Persist to Firestore
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          favourites: isFav ? arrayRemove(id) : arrayUnion(id),
        })
      }
    },

    isFavourite(id) {
      return this.favourites.includes(id)
    },
  },
})
