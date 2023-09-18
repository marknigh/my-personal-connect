import { defineStore } from 'pinia'

export const useForgotPasswordStore = defineStore('forgotPassword', {
  state: () => ({
    username: ''
  })
})
