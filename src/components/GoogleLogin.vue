<template>
  <q-btn class="btn-fixed-width" style="background-image: url('/src/assets/signInGoogle.png')" @click="loginWithGoogle" />
</template>

<script setup>
import { Auth } from 'aws-amplify'
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'

async function loginWithGoogle () {
  try {
    await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })
  } catch (error) {
    console.error('Error when authenticating with Google: ', error)
  }
}
</script>

<style lang="scss" scoped>
.btn-fixed-width {
  width: 175px
}
</style>
