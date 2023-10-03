<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card class="my-card" flat>
          <q-card-section>
              <h4 class="text-center text-weight-thin">Register</h4>
          </q-card-section>

          <q-card-section>
            <div class="row">
              <div class="col">
                <q-input
                  type="email"
                  label="Username"
                  v-model="username"
                >
                  <template #before>
                    <q-icon name="account_circle" />
                  </template>
                </q-input>
              </div>
            </div>

            <q-input
              type="password"
              label="Password"
              v-model="password"
            >
              <template #before>
                <q-icon name="lock" />
              </template>
            </q-input>

            <q-input
              :rules="[value => password === value || 'Passwords must match']"
              lazy-rules
              type="password"
              label="Confirm Password"
              v-model="confirmedPassword"
            >
              <template v-slot:before>
                <q-icon name="confirmation_number" />
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
import { useVertificationStore } from '../stores/vertification'

const router = useRouter()

const verificationStore = useVertificationStore()

const username = ref('')
const password = ref('')
const confirmedPassword = ref('')

async function signUp () {
  try {
    await Auth.signUp({
      username: username.value,
      password: password.value,
      attributes: { },
      autoSignIn: { // optional - enables auto sign in after user is confirmed
        enabled: true
      }
    })
    verificationStore.username = username.value
    router.push({ name: 'verification' })
  } catch (error) {
    console.log('error signing up:', error)
  }
}

</script>

<style lang="sass" scoped>
.my-card
  width: 50%
  max-width: 350px
</style>
