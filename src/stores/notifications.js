import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    enabled: JSON.parse(localStorage.getItem('notificationsEnabled') || 'false'),
    toasts: [], // { id, message }
  }),

  actions: {
    setEnabled(value) {
      this.enabled = value
      localStorage.setItem('notificationsEnabled', JSON.stringify(value))
    },

    addToast(message) {
      const id = Date.now()
      this.toasts.push({ id, message })
      // Auto-remove after 5 seconds
      setTimeout(() => {
        this.removeToast(id)
      }, 5000)
    },

    removeToast(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
  },
})
