import { defineStore } from 'pinia'

export const useProfileStore = defineStore('profile', {
  state: () => {
    return {
      agentStatusColors: []
    }
  },

  getters: {
  },

  actions: {
  },
  persist: true
})
