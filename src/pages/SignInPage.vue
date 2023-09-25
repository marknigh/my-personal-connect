<template>
  <q-layout>
    <q-page-container v-if="!verification" class="flex flex-center">
        <q-toolbar>
          <q-toolbar-title>
            <h3 class="text-center text-weight-thin">My Personal Amazon Connect</h3>
          </q-toolbar-title>
        </q-toolbar>
          <q-card flat>
            <q-card-section style="min-width: 400px;">
              <q-input
                ref="usernameRef"
                type="email"
                label="Username"
                :rules="[(val, rules) => rules.email(val) || 'Must be In Email Format']"
                lazy-rules="ondemand"
                v-model="username"
              >
                <template #before>
                  <q-icon name="account_circle" color="primary"/>
                </template>
              </q-input>

              <q-input
                ref="passwordRef"
                type="password"
                label="Password"
                :rules="[val => !!val || 'Field is Required']"
                lazy-rules="ondemand"
                v-model="password"
              >
                <template #before>
                  <q-icon name="lock" color="primary"/>
                </template>
              </q-input>

            </q-card-section>

            <q-card-section v-if="loginError">
              <q-banner dense inline-actions class="text-white bg-red">
                Login Error
                <template #action>
                  <q-btn flat label="dismiss" @click="dismissError"/>
                  <q-btn v-if="forgotPassword" flat label="Forgot Password?" @click="forgotPasswordCode"/>
                </template>
              </q-banner>
            </q-card-section>

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
          </q-card>
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
              <template #before>
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
import { useForgotPasswordStore } from 'stores/forgotpassword'
import GoogleLogin from 'components/GoogleLogin.vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const forgotPasswordStore = useForgotPasswordStore()
const router = useRouter()

const username = ref(null)
const usernameRef = ref(null)
const password = ref(null)
const passwordRef = ref(null)
const verification = ref(false)
const cognitoUser = ref({})
const loginError = ref(false)
const forgotPassword = ref(false)

async function signIn () {
  usernameRef.value.validate()
  passwordRef.value.validate()

  if (usernameRef.value.hasError || passwordRef.value.hasError) {
    // validation errors
  } else {
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
      loginError.value = true
      if (error.name === 'NotAuthorizedException') {
        forgotPassword.value = true
      }
      console.log('error signing in', error)
    }
  }
}

async function changePassword () {
  const loggedInUser = await Auth.completeNewPassword(cognitoUser.value, password.value)
  console.log(loggedInUser)
  router.push({ path: '/' })
}

function dismissError () {
  username.value = null
  password.value = null

  loginError.value = false
  forgotPassword.value = false
  usernameRef.value.resetValidation()
  passwordRef.value.resetValidation()
}

// Send confirmation code to user's email
async function forgotPasswordCode () {
  try {
    await Auth.forgotPassword(username.value)
    forgotPasswordStore.username = username.value
    router.push('/forgotpassword')
  } catch (err) {
    console.log(err)
  }
}

</script>

<style lang="css" scoped>
</style>
