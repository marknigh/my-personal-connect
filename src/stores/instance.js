import { defineStore } from 'pinia'

export const useInstanceStore = defineStore('instance', {
  state: () => {
    return {
      Id: ''
    }
  },

  getters: {
  },

  actions: {
  },
  persist: true
})
