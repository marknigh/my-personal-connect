<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card flat>
          <q-card-section>
              <h4 class="text-center text-weight-thin">Register</h4>
          </q-card-section>

          <q-card-section>
            <q-input
              type="email"
              label="Username"
              v-model="username">
                <template v-slot:before>
                  <q-icon name="eva-person-outline" />
                </template>
            </q-input>

            <q-input
              type="password"
              label="Password"
              v-model="password">
                <template v-slot:before>
                  <q-icon name="eva-lock-outline" />
                </template>
            </q-input>

          </q-card-section>

          <q-card-actions>
            <q-btn color="primary" class="full-width" label="Register" @click="signUp" />
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { Auth } from 'aws-amplify'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const router = useRouter()
import { useVertificationStore } from '../stores/vertification'

const verificationStore = useVertificationStore()

async function signUp () {
  try {
    const { user } = await Auth.signUp({
      username: username.value,
      password: password.value,
      attributes: { },
      autoSignIn: { // optional - enables auto sign in after user is confirmed
        enabled: true
      }
    })
    console.log(user)
    verificationStore.username = username.value
    router.push({ name: 'verification' })
  } catch (error) {
    console.log('error signing up:', error)
  }
}

</script>

<style>
</style>
