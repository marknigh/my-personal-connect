<template>
  <div>
{{ contactId }}
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, DescribeContactCommand, GetContactAttributesCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'
import { useRoute } from 'vue-router'

const instanceStore = useInstanceStore()
const route = useRoute()
const creds = ref(null)
const contactId = ref()
onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      getContactDetails()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function getContactDetails () {
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
    ContactId: route.params.contactid
  }

  const attributeInput = {
    InstanceId: instanceStore.Id,
    InitialContactId: route.params.contactid
  }

  try {
    const DescribeContactResponse = await client.send(new DescribeContactCommand(input))
    console.log('DescribeContactResponse: ', DescribeContactResponse)
    const GetContactAttributesResponse = await client.send(new GetContactAttributesCommand(attributeInput))
    console.log('GetContactAttributesResponse: ', GetContactAttributesResponse)
  } catch (error) {
    console.log('Error retrieving queue list: ', error)
  }
}
</script>

<style lang="scss" scoped>

</style>
