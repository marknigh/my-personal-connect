<template>
  <div>
    {{  contactInfo }}
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, DescribeContactCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'

const instanceStore = useInstanceStore()

const contactInfo = ref(null)
const creds = ref({})

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      getContactInfo()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function getContactInfo (queue) {
  const client = new ConnectClient({
    region: 'us-east-1',
    credentials: creds.value
  })

  const input = {
    InstanceId: instanceStore.Id,
    ContactId: '0d5f5ec0-1457-4ccb-81d0-e00e5aa8221f'
  }

  const command = new DescribeContactCommand(input)

  try {
    const DescribeContactResponse = await client.send(command)
    console.log(DescribeContactResponse)
    contactInfo.value = DescribeContactResponse
  } catch (error) {
    console.log('Error retrieving queue list: ', error)
  }
}

</script>

<style lang="scss" scoped>

</style>
