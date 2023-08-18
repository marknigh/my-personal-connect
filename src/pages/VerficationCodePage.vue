<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card flat>
          <q-card-section>
              <h4 class="text-center text-weight-thin">Verification Code</h4>
          </q-card-section>

          <q-card-section>
            <q-input
              type="text"
              label="Verification Code"
              v-model="code">
                <template v-slot:before>
                  <q-icon name="eva-person-outline" />
                </template>
            </q-input>

          </q-card-section>

          <q-card-actions>
            <q-btn color="primary" class="full-width" label="Verify" @click="verify" />
          </q-card-actions>

          <div class="text-center"> <q-btn flat @click="resendCode()">Resend Code?</q-btn></div>

        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { Auth } from 'aws-amplify'
import { ref } from 'vue'
import { useVertificationStore } from '../stores/vertification'
import { useRouter } from 'vue-router'

const verificationStore = useVertificationStore()
const router = useRouter()

const code = ref()

async function verify () {
  try {
    await Auth.confirmSignUp(verificationStore.username, code.value)
    router.push('/')
  } catch (error) {
    console.log('error confirming sign up', error)
  }
}

async function resendCode () {
  try {
    await Auth.resendSignUp(verificationStore.username)
  } catch (err) {
    console.log('error resending code: ', err)
  }
}
</script>

<style lang="scss" scoped>

</style>
