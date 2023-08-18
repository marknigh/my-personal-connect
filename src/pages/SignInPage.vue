<template>
  <q-layout>
      <q-page-container>
        <q-page v-if="!verification" class="flex flex-center">
            <q-card flat>

              <q-card-section>
                <h4 class="text-center text-weight-thin">My Personal Amazon Connect</h4>
              </q-card-section>

              <q-card-section>
                <q-input
                  type="email"
                  label="Username"
                  v-model="username">
                    <template v-slot:before>
                      <q-icon name="o_account_circle" />
                    </template>
                </q-input>

                <q-input
                  type="password"
                  label="Password"
                  v-model="password">
                    <template v-slot:before>
                      <q-icon name="o_lock" />
                    </template>
                </q-input>

              </q-card-section>

              <!-- <q-banner v-if="loginError" dense class="text-white bg-red"> Login Error </q-banner> -->

              <q-card-actions>
                  <q-btn color="primary" class="full-width" label="Login" @click="signIn()"/>
              </q-card-actions>

              <div class="text-center">Don't have an Account? <router-link to="/signup">Create One</router-link></div>

              <div class="row">
                <div class="col q-pt-sm"><q-separator/></div>
                <div class="col text-center">OR</div>
                <div class="col q-pt-sm"><q-separator/></div>
              </div>

              <q-card-actions>
                <google-login />
              </q-card-actions>

              <!-- <q-card-actions>
                <facebook-login />
              </q-card-actions> -->

            </q-card>
        </q-page>
        <q-page v-if="verification" class="flex flex-center">
        <q-card flat>
          <q-card-section>
              <h4 class="text-center text-weight-thin">Change Password</h4>
          </q-card-section>

          <q-card-section>

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
            <q-btn color="primary" class="full-width" label="Verify" @click="changePassword" />
          </q-card-actions>
        </q-card>
      </q-page>

      </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { Auth } from 'aws-amplify'
import { useUserStore } from 'stores/user'
import GoogleLogin from 'components/GoogleLogin.vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const verification = ref(false)
const cognitoUser = ref({})

async function signIn () {
  try {
    const user = await Auth.signIn(username.value, password.value)
    console.log('SignInPage->user: ', user.attributes)
    if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
      cognitoUser.value = user.attributes
      verification.value = true
    }
    userStore.user = user.attributes
    router.push({ path: '/' })
  } catch (error) {
    console.log('error signing in', error)
  }
}

async function changePassword () {
  const loggedInUser = await Auth.completeNewPassword(cognitoUser.value, password.value)
  console.log(loggedInUser)
  router.push({ path: '/' })
}
</script>

<style lang="css" scoped>
</style>
