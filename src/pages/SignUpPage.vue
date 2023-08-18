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
                  v-model="username">
                    <template v-slot:before>
                      <q-icon name="o_account_circle" />
                    </template>
                </q-input>
              </div>
            </div>

            <q-input
              type="password"
              label="Password"
              v-model="password">
                <template v-slot:before>
                  <q-icon name="o_lock" />
                </template>
            </q-input>

            <q-input
              :rules="[value => password === value || 'Passwords must match']"
              lazy-rules
              type="password"
              label="Confirm Password"
              v-model="confirmedPassword">
                <template v-slot:before>
                  <q-icon name="o_confirmation_number" />
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
const confirmedPassword = ref('')
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

<style lang="sass" scoped>
.my-card
  width: 50%
  max-width: 350px
</style>
