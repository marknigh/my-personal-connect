<template>
  <q-page padding>
    <div class="fit row wrap justify-evenly">
      <q-toolbar>
        <q-toolbar-title>
          Users
        </q-toolbar-title>
      </q-toolbar>
      <div style="min-width: 400px;">
        <q-scroll-area style="height: 500px;"
          :thumb-style="thumbStyle"
        >
          <q-list separator>
            <q-item clickable v-ripple @click="GetUserDetails(user)" v-for="user in users" :key="user.Id">
              <q-item-section>
                <q-item-label lines="1">{{ user.username }}</q-item-label>
                <!-- <q-item-label caption>{{ user.QueueType }}</q-item-label> -->
              </q-item-section>

              <q-item-section side>
                <q-icon name="info" color="green" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </div>
      <q-separator spaced vertical color="black" style="height: 500px"/>
      <div class="col-5 row items-center">
        <div v-if="userDetails">
          <p class="no-margin text-subtitle1 text-bold">
            <q-icon name="account_box" color="primary" size="16px"/>
            {{ userDetails.IdentityInfo.FirstName }} {{ userDetails.IdentityInfo.LastName }}
          </p>
          <p class="no-margin text-body2">
            <q-icon name="email" color="secondary" size="16px"/>
            {{ userDetails.IdentityInfo.Email }}
          </p>
          <p class="no-margin text-body2">
            <q-icon name="phone" color="accent" size="16px"/>
            {{ userDetails.PhoneConfig.PhoneType }}
          <span v-if="userDetails.PhoneConfig.PhoneType == 'DESK_PHONE'">, {{ userDetails.PhoneConfig.DeskPhoneNumber }}</span></p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, DescribeUserCommand, ListUsersCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'

const instanceStore = useInstanceStore()

const creds = ref()
const users = ref([])
const userDetails = ref(null)

const thumbStyle = ref({
  right: '2px',
  borderRadius: '5px',
  backgroundColor: '#027be3',
  width: '5px',
  opacity: '0.75'
})

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      // console.log('currentCredentials: ', credentials)
      creds.value = credentials
      GetUserList()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function GetUserList () {
  const credentials = {
    accessKeyId: creds.value.accessKeyId,
    secretAccessKey: creds.value.secretAccessKey,
    sessionToken: creds.value.sessionToken
  }

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials
  })

  const input = {
    InstanceId: instanceStore.Id
  }

  const command = new ListUsersCommand(input)

  try {
    const response = await client.send(command)
    response.UserSummaryList.forEach((element) => {
      users.value.push({ username: element.Username, id: element.Id })
    })
  } catch (error) {
    console.log('Error retrieving hours of operation list: ', error)
  }
}

async function GetUserDetails (user) {
  const credentials = {
    accessKeyId: creds.value.accessKeyId,
    secretAccessKey: creds.value.secretAccessKey,
    sessionToken: creds.value.sessionToken
  }

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials
  })

  const input = {
    InstanceId: instanceStore.Id,
    UserId: user.id
  }

  const command = new DescribeUserCommand(input)

  try {
    const response = await client.send(command)
    userDetails.value = response.User
  } catch (error) {
    console.log('Error retrieving user list: ', error)
  }
}
</script>

<style lang="scss" scoped>

</style>
