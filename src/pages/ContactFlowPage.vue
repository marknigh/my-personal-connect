<template>
  <template v-for="(action, index) in contactFlowDetail.Actions" :key="index">
    <p> {{  action.Parameters }}</p>
  </template>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, DescribeContactFlowCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'
import { useRoute } from 'vue-router'

const route = useRoute()
const instanceStore = useInstanceStore()
const contactFlowDetail = ref({})
const creds = ref(null)

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      getContactFlowDetails()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function getContactFlowDetails () {
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
    ContactFlowId: route.params.id
  }

  const command = new DescribeContactFlowCommand(input)

  try {
    const DescribeContactFlowResponse = await client.send(command)
    console.log(DescribeContactFlowResponse)
    contactFlowDetail.value = JSON.parse(DescribeContactFlowResponse.ContactFlow.Content)
    console.log(JSON.parse(contactFlowDetail.value.Content))
  } catch (error) {
    console.log('Error retrieving queue list: ', error)
  }
}

</script>

<style lang="scss" scoped>

</style>
