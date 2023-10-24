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

        <div class="q-mr-md">
          Hello<span v-if="userStore.user.attributes.given_name">, {{  userStore.user.attributes.given_name }} </span>
        </div>

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

        <q-item clickable>
          <q-item-section avatar>
            <q-icon color="blue" name="timelapse" />
          </q-item-section>

          <q-item-section>Hours Of Operation</q-item-section>
            <q-item-section side>
              <q-icon name="keyboard_arrow_right" />
          </q-item-section>

            <q-menu anchor="top right" self="top left">
              <q-list>
                <q-item clickable :to="{ path: '/hoursofoperations'}">
                  <q-item-section avatar>
                    <q-icon color="blue" name="schedule" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Hours of Operations - Connect</q-item-label>
                    <q-item-label caption>View of Hours of Operations</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable :to="{ path: '/calendarview'}">
                  <q-item-section avatar>
                    <q-icon color="blue" name="calendar_month" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Calendar View - Connect</q-item-label>
                    <q-item-label caption>Calendar View of Hours Open</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable :to="{ path: '/customschedules'}">
                  <q-item-section avatar>
                    <q-icon color="blue" name="date_range" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Custom Schedule</q-item-label>
                    <q-item-label caption>Custom Schedule for your Queue</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable :to="{ path: '/holidays'}">
                  <q-item-section avatar>
                    <q-icon color="blue" name="insert_invitation" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Holiday Schedule</q-item-label>
                    <q-item-label caption>Create a Holiday Schedule</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
        </q-item>

        <q-item clickable>
          <q-item-section avatar>
            <q-icon color="blue" name="directions" />
          </q-item-section>

          <q-item-section>Call Flows</q-item-section>
            <q-item-section side>
              <q-icon name="keyboard_arrow_right" />
          </q-item-section>

            <q-menu anchor="top right" self="top left">
              <q-list>
                <q-item clickable :to="{ path: '/contactflows'}">
                  <q-item-section avatar>
                    <q-icon color="blue" name="account_tree" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Contact Flows - Custom Schedule</q-item-label>
                    <q-item-label caption>List of Contact Flows</q-item-label>
                  </q-item-section>
                </q-item>

              </q-list>
            </q-menu>
        </q-item>
        <q-item clickable :to="{ path: '/contacts'}">
          <q-item-section avatar>
            <q-icon color="blue" name="contacts" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Contacts</q-item-label>
            <q-item-label caption>List of Contacts</q-item-label>
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

        <q-item clickable :to="{ path: '/routingprofiles'}">
          <q-item-section avatar>
            <q-icon color="blue" name="directions_bus" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Routing Profiles</q-item-label>
            <q-item-label caption>List of Routing Profiles</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ path: '/menucounts'}">
          <q-item-section avatar>
            <q-icon color="blue" name="numbers" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Menu Counts</q-item-label>
            <q-item-label caption>Menu Navigation Counts</q-item-label>
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
// import { useRouter } from 'vue-router'

const leftDrawerOpen = ref(false)

const userStore = useUserStore()
// const router = useRouter()

async function SignOut () {
  Auth.signOut()
}

</script>

<style lang="scss" scoped>

</style>
