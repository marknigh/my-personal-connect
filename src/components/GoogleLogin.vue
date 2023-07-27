<template>
    <q-btn color="red" icon="eva-google" left class="full-width" label="Login with Google" @click="loginWithGoogle"/>
</template>

<script setup>
import Auth, { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'

async function loginWithGoogle () {
  try {
    await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })
  } catch (error) {
    console.error('Error when authenticating with Google: ', error)
  }
}
</script>

<style lang="scss" scoped>

</style>
