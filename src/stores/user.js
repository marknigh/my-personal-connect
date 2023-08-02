import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      user: {}
    }
  },

  getters: {
    // getters
  },

  actions: {
    // actions
  },
  persist: true
})
