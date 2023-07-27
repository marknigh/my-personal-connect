<template>
  <q-btn color="blue" icon="eva-facebook" left class="full-width" label="Login with Facebook" @click="loginWithFacebook"/>
</template>

<script setup>
import { Auth } from 'aws-amplify'
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'

async function loginWithFacebook () {
  await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Facebook })
}
</script>

<style lang="scss" scoped>

</style>
