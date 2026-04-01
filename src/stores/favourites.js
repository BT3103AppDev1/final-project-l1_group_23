import { defineStore } from 'pinia'

export const useFavouritesStore = defineStore('favourites', {
  state: () => ({
    favourites: [],
  }),
  actions: {
    toggle(id) {
      const idx = this.favourites.indexOf(id)
      if (idx === -1) this.favourites.push(id)
      else this.favourites.splice(idx, 1)
    },
    isFavourite(id) {
      return this.favourites.includes(id)
    },
  },
})
