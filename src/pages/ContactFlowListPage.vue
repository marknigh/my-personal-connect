<template>
<q-page padding>
  <q-list padding>
    <q-toolbar>
        <q-toolbar-title shrink>
          Call Flows
        </q-toolbar-title>
      </q-toolbar>
    <template v-for="(flow, index) in flows" :key="index">
      <q-item clickable v-ripple @click="GetCFDetails(flow)">
        <q-item-section avatar>
          <q-avatar size="xs" :color="flow.ContactFlowState == 'ACTIVE' ? 'green' : 'red'" icon="notifications_active" text-color="white"/>
        </q-item-section>
        <q-item-section>{{ flow.Name }}</q-item-section>
        <q-item-section>{{ flow.ContactFlowType }}</q-item-section>
      </q-item>
    </template>
    </q-list>
</q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, ListContactFlowsCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'
import { useRouter } from 'vue-router'

const router = useRouter()
const instanceStore = useInstanceStore()

const flows = ref([])
const creds = ref({})

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      getContactFlows()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function getContactFlows () {
  const client = new ConnectClient({
    region: 'us-east-1',
    credentials: creds.value
  })

  const input = {
    InstanceId: instanceStore.Id,
    ContactFlowTypes: [],
    NextToken: '',
    MaxResults: 25
  }

  const command = new ListContactFlowsCommand(input)

  try {
    const ListContactFlowsResponse = await client.send(command)
    console.log(ListContactFlowsResponse)
    flows.value = ListContactFlowsResponse.ContactFlowSummaryList
  } catch (error) {
    console.log('Error retrieving contact flow list: ', error)
  }
}

function GetCFDetails (flow) {
  router.push({ name: 'contactflow', params: { id: flow.Id } })
}
</script>

<style lang="scss" scoped>

</style>
