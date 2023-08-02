<template>
  <div>
  </div>
</template>

<script setup>
import { Auth, Hub } from 'aws-amplify'
import { useUserStore } from '../stores/user'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  Hub.listen('auth', ({ payload: { event, data } }) => {
    switch (event) {
      case 'signIn':
        console.info('signIn from Hub Listen')
        getUser().then((userData) => {
          userStore.user = userData
        })
        break
      case 'cognitoHostedUI':
        getUser().then((userData) => {
          userStore.user = userData
        })
        break
      case 'signOut':
        console.log('signOut from Hub Listen')
        router.push({ path: '/' })
        break
      case 'signIn_failure':
      case 'cognitoHostedUI_failure':
        console.log('Sign in failure', data)
        break
    }
  })
})

function getUser () {
  return Auth.currentAuthenticatedUser().then(userData => userData)
}
</script>

<style lang="scss" scoped>

</style>
