<template>
  <q-item-section v-if="statusItems.length > 0">
    <q-item-label>
      <q-badge rounded :color="getColor()" :label="status" />
    </q-item-label>
  </q-item-section>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { ConnectClient, ListAgentStatusesCommand } from '@aws-sdk/client-connect'
const props = defineProps(['status', 'creds', 'instanceId'])
const statusItems = ref([])

onBeforeMount(async () => {
  GetUserStatus()
})

function getColor () {
  const statusElement = statusItems.value.find((e) => e.Name === props.status)
  console.log('statusElement: ', statusElement.Type)
  return statusElement.Type === 'ROUTABLE' ? 'green' : 'red'
}

async function GetUserStatus () {
  const credentials = {
    accessKeyId: props.creds.accessKeyId,
    secretAccessKey: props.creds.secretAccessKey,
    sessionToken: props.creds.sessionToken
  }

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials
  })

  const input = { // ListAgentStatusRequest
    InstanceId: props.instanceId, // required
    AgentStatusTypes: ['ROUTABLE', 'CUSTOM', 'OFFLINE']
  }

  const command = new ListAgentStatusesCommand(input)

  try {
    const ListAgentStatusResponse = await client.send(command)
    console.log('SearchUsersResponse: ', ListAgentStatusResponse.AgentStatusSummaryList)
    ListAgentStatusResponse.AgentStatusSummaryList.forEach((element) => {
      statusItems.value.push(element)
    })
  } catch (error) {
    console.log('Error retrieving hours of Describe User Hierarchy Structure Response: ', error)
  }
}
</script>
<style lang="scss" scoped>

</style>
