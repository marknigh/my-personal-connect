<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card flat>
          <q-card-section>
              <h4 class="text-center text-weight-thin">Forgot Password</h4>
          </q-card-section>

          <q-card-section>
            <q-input
              bottom-slots
              type="text"
              label="Confirmation Code"
              v-model="code"
            >
              <template v-slot:before>
                <q-icon name="eva-person-outline" />
              </template>
              <template v-slot:hint>
                Check Email for Code
              </template>
            </q-input>

            <q-input
              type="password"
              label="New Password"
              v-model="password"
            >
              <template v-slot:before>
                <q-icon name="o_lock" />
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
                <q-icon name="o_confirmation_number" />
              </template>
            </q-input>

          </q-card-section>

          <q-card-actions>
            <q-btn color="primary" class="full-width" label="new password" @click="ForgotPassword" />
          </q-card-actions>

          <!-- <div class="text-center"> <q-btn flat @click="resendCode()">Resend Code?</q-btn></div> -->

        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { Auth } from 'aws-amplify'
import { ref } from 'vue'
import { useForgotPasswordStore } from '../stores/forgotpassword'
import { useRouter } from 'vue-router'

const forgotPasswordStore = useForgotPasswordStore()
const router = useRouter()

const code = ref()
const password = ref('')
const confirmedPassword = ref('')

// Collect confirmation code and new password
async function ForgotPassword () {
  try {
    const data = await Auth.forgotPasswordSubmit(forgotPasswordStore.username, code.value, password.value)
    console.log(data)
    router.push('/')
  } catch (err) {
    console.log(err)
  }
}

</script>

<style lang="scss" scoped>

</style>
