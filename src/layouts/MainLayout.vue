<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="menu"
          aria-label="Menu"
        />

        <q-toolbar-title class="text-center">
          My Personal Amazon Connect
        </q-toolbar-title>

        <div>
          <q-btn flat dense icon="logout" @click="SignOut()" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-2"
    >
      <q-list>
        <q-item-label header class="text-center text-bold">Menu</q-item-label>

        <q-item clickable :to="{ path: '/metrics'}">
          <q-item-section avatar>
            <q-icon color="blue" name="insights" />
          </q-item-section>
          <q-item-section>
            <q-item-label>RealTime Metrics</q-item-label>
            <q-item-label caption>RealTime Metrics</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ path: '/hoursofoperations'}">
          <q-item-section avatar>
            <q-icon color="blue" name="schedule" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Hours of Operations</q-item-label>
            <q-item-label caption>View of Hours of Operations</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ path: '/queues'}">
          <q-item-section avatar>
            <q-icon color="blue" name="toc" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Queues</q-item-label>
            <q-item-label caption>List of Queues</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ path: '/listusers'}">
          <q-item-section avatar>
            <q-icon color="blue" name="groups_2" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Users</q-item-label>
            <q-item-label caption>List of Users</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ path: '/profile'}">
          <q-item-section avatar>
            <q-icon color="blue" name="person_outline" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Profile</q-item-label>
            <q-item-label caption>Information about yourself</q-item-label>
          </q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useUserStore } from 'stores/user'
import { ref } from 'vue'
import { Auth } from 'aws-amplify'
import { useRouter } from 'vue-router'

const leftDrawerOpen = ref(false)

const userStore = useUserStore()
const router = useRouter()

async function SignOut () {
  try {
    userStore.$patch({})
    await Auth.signOut()
    router.push('/signin')
  } catch (error) {
    console.log('error signing out: ', error)
  }
}
</script>

<style lang="scss" scoped>

</style>
