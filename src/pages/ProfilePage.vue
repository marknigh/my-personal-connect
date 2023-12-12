<template>
  <q-page v-if="!loading" padding>
    <p class="text-h6 text-weight-medium">User Info</p>

    <div class="row">
      <div class="col-4">
        <q-input readonly v-model="currentUser.attributes.email" type="text" label="username" />
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        <q-input v-model="currentUser.attributes.given_name" type="text" label="First Name" />
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        <q-input v-model="currentUser.attributes.family_name" type="text" label="Last Name" />
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        <q-input v-model="instanceId" type="text" label="Instance ID" />
      </div>
    </div>
    <div class="row">
      <q-list padding>
        <p class="text-h6 text-weight-medium q-mt-md">Agent Status Colors</p>
        <q-item>
          <template v-if="agentStatuses.length > 0">
            <q-item-section class="q-gutter-xl" v-for="status in agentStatuses" :key="status.Id">
              <profile-agent-status-color
                :status="status"
                :statusHexColor="statusHexColor(status.Id)"
                @changeInColor="UpdateAgentStatus"
              >
              </profile-agent-status-color>
          </q-item-section>
        </template>
      </q-item>
      <q-separator spaced />
    </q-list>
  </div>
  <div class="row">
    <div class="q-pt-md">
      <q-btn color="primary" label="Save" @click="saveProfile" />
    </div>
    <div class="self-end">
      <q-btn flat label="delete account" @click="deleteAccount"/>
    </div>
  </div>
</q-page>
  <template v-else>
    <q-page class="flex flex-center">
      <q-circular-progress
        indeterminate
        size="75px"
        :thickness="0.6"
        color="primary"
        center-color="secondary"
        class="q-ma-md"
      />
    </q-page>
  </template>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Auth, API } from 'aws-amplify'
import { useInstanceStore } from '../stores/instance'
import { useProfileStore } from '../stores/profile'
import { useUserStore } from '../stores/user'
import { ConnectClient, ListAgentStatusesCommand } from '@aws-sdk/client-connect'
import ProfileAgentStatusColor from 'src/components/ProfileAgentStatusColor.vue'
import { getProfile } from '../graphql/queries'
import { addProfile } from '../graphql/mutations'

const instanceStore = useInstanceStore()
const router = useRouter()
const $q = useQuasar()

const currentUser = ref()
const loading = ref(true)
const instanceId = ref(instanceStore.Id)
const userStore = useUserStore()
const profileStore = useProfileStore()
const creds = ref()
const agentStatuses = ref([])
const agentProfileConfig = ref({
  Id: userStore.user.username,
  agentStatus: []
})

onBeforeMount(() => {
  Auth.currentAuthenticatedUser().then((user) => {
    currentUser.value = user
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      GetAgentStatuses()
      GetProfile()
    })
  })
})

function statusHexColor (statusId) {
  const color = agentProfileConfig.value.agentStatus.find((element) => element.id === statusId)
  return color
}

async function saveProfile () {
  instanceStore.Id = instanceId.value
  await Auth.updateUserAttributes(currentUser.value, {
    family_name: currentUser.value.attributes.family_name,
    given_name: currentUser.value.attributes.given_name
  })
  userStore.user.attributes.family_name = currentUser.value.attributes.family_name
  userStore.user.attributes.given_name = currentUser.value.attributes.given_name
}

async function deleteAccount () {
  $q.dialog({
    title: 'Delete Account',
    message: 'Type \'delete\' ',
    prompt: {
      isValid: val => val === 'delete'
    },
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const result = await Auth.deleteUser()
      console.log(result)
      router.push('/signin')
    } catch (error) {
      console.log('Error deleting user', error)
    }
  })
}

async function GetAgentStatuses () {
  const credentials = {
    accessKeyId: creds.value.accessKeyId,
    secretAccessKey: creds.value.secretAccessKey,
    sessionToken: creds.value.sessionToken
  }

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials
  })

  const input = { // ListAgentStatusRequest
    InstanceId: instanceStore.Id, // required
    AgentStatusTypes: ['ROUTABLE', 'CUSTOM', 'OFFLINE']
  }

  const command = new ListAgentStatusesCommand(input)

  try {
    const ListAgentStatusResponse = await client.send(command)
    ListAgentStatusResponse.AgentStatusSummaryList.forEach((element) => {
      agentStatuses.value.push(element)
    })
  } catch (error) {
    console.log('Error retrieving hours of Describe User Hierarchy Structure Response: ', error)
  }
}

async function UpdateAgentStatus (status, color) {
  // console.log('UpdateAgentStatus: ', status, color)
  const agentStatusElement = agentProfileConfig.value.agentStatus.findIndex((element) => element.id === status.Id)
  if (agentStatusElement >= 0) {
    agentProfileConfig.value.agentStatus.splice(agentStatusElement, { Id: status.Id, name: status.Name, color })
  } else {
    agentProfileConfig.value.agentStatus.push({ id: status.Id, name: status.Name, color })
  }
  // const createProfile = /* GraphQL */ `
  // mutation addProfile ($ProfileInput: ProfileInput) {
  //   addProfile(ProfileInput: $ProfileInput) {
  //     id
  //   }
  // }`

  try {
    const response = await API.graphql({
      query: addProfile,
      variables: {
        ProfileInput: {
          id: agentProfileConfig.value.Id,
          agentStatus: agentProfileConfig.value.agentStatus
        }
      }
    })
    console.log('response: ', response)
  } catch (error) {
    console.log('Error updating Agent State Colors: ', error)
  }
}

async function GetProfile () {
  // const getProfile = /* GraphQL */ `
  //   query GetProfile ($id: String){
  //     getProfile (id: $id) {
  //       id
  //       agentStatus {
  //         color
  //         id
  //         name
  //       }
  //     }
  //   }`

  try {
    const response = await API.graphql({
      query: getProfile,
      variables: {
        id: agentProfileConfig.value.Id
      }
    })
    console.log('response: ', response)
    response.data.getProfile.agentStatus.forEach((element) => {
      agentProfileConfig.value.agentStatus.push(element)
    })
    profileStore.agentStatusColors = []
    response.data.getProfile.agentStatus.forEach((element) => {
      profileStore.agentStatusColors.push(element)
    })
  } catch (error) {
    console.log('Error getting Agent State Colors: ', error)
  } finally {
    loading.value = false
  }
}

</script>

<style lang="sass" scoped>

</style>
