<template>
  <template v-if="loading">
    <q-item-label class="items-center">
      <q-spinner
        color="primary"
        size="3rem"
        :thickness="5"
      />
    </q-item-label>
  </template>
  <template v-if="!loading">
    <q-item-label lines="5" caption>
      <template v-for="(queue, index) in queueList" :key="index">
        <p class="no-margin q-pl-lg">
          {{  queue.QueueName }} - {{ queue.Channel }}
        </p>
      </template>
    </q-item-label>
  </template>
</template>

<script setup>
import { ref } from 'vue'
// import { Auth } from 'aws-amplify'
import { ConnectClient, ListRoutingProfileQueuesCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'

const instanceStore = useInstanceStore()
const props = defineProps(['routingProfileId', 'creds'])
const queueList = ref([])
const loading = ref(true)

GetAssociatedQueues()

async function GetAssociatedQueues () {
  const credentials = {
    accessKeyId: props.creds.accessKeyId,
    secretAccessKey: props.creds.secretAccessKey,
    sessionToken: props.creds.sessionToken
  }

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials
  })

  const input = {
    InstanceId: instanceStore.Id,
    RoutingProfileId: props.routingProfileId
  }

  const command = new ListRoutingProfileQueuesCommand(input)

  try {
    const ListRoutingProfileQueuesResponse = await client.send(command)
    ListRoutingProfileQueuesResponse.RoutingProfileQueueConfigSummaryList.forEach((element) => {
      queueList.value.push(element)
    })
    loading.value = false
  } catch (error) {
    console.log('Error retrieving hours of operation list: ', error)
  }
}

</script>

<style lang="scss" scoped>

</style>
