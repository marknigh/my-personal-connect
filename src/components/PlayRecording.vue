<template>
  <div v-if="loading">
    <q-spinner
        color="primary"
        :thickness="5"
      />
  </div>
  <div v-if="!loading">
    <audio controls>
      <source :src="source">
    </audio>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'

const loading = ref(true)
const creds = ref(null)
const source = ref(null)

const props = defineProps({
  contactId: {
    type: String,
    required: true
  },
  agentConnectTimestamp: {
    type: String,
    required: true
  }
})

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      getRecording()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function getRecording () {
  const credentials = {
    accessKeyId: creds.value.accessKeyId,
    secretAccessKey: creds.value.secretAccessKey,
    sessionToken: creds.value.sessionToken
  }

  const client = new S3Client(
    {
      region: 'us-east-1',
      credentials
    }
  )

  // create key of object
  const initialPath = 'connect/mark-nigh/CallRecordings/'
  const year = props.agentConnectTimestamp.substr(0, 4)
  const month = props.agentConnectTimestamp.substr(5, 2)
  const day = props.agentConnectTimestamp.substr(8, 2)
  const time = props.agentConnectTimestamp.substr(10, 6)
  const filePath = year + '/' + month + '/' + day + '/'
  const fileName = props.contactId + '_' + year + month + day + time + '_UTC.wav'
  const key = initialPath + filePath + fileName

  const command = new GetObjectCommand({
    Bucket: 'amazon-connect-ece2f486e17a',
    Key: key
  })

  try {
    const response = await client.send(command)
    try {
      const dataRead = await response.Body.transformToByteArray()
      const blob = new Blob([dataRead])
      source.value = URL.createObjectURL(blob)
    } catch (err) {
      console.error('error in making wav file: ', err)
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

</script>

<style lang="scss" scoped>

</style>
