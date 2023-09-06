<template>
  <q-page padding>
    <div class="fit row wrap justify-evenly">
      <q-toolbar>
        <q-toolbar-title shrink>
          Queues
        </q-toolbar-title>
      </q-toolbar>
      <div style="min-width: 400px;">
        <q-list separator>

          <q-item clickable v-ripple @click="GetQueueInfo(queue)" v-for="queue in queues" :key="queue.id">

            <q-item-section>
              <q-item-label lines="1">{{ queue.Name }}</q-item-label>
              <q-item-label caption>{{ queue.QueueType }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-icon name="info" color="green" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <q-separator spaced vertical color="black" style="height: 500px"/>
      <div class="col-5 row items-center">
        <div v-if="queueInfo">
          <p class="no-margin text-h5 text-bold">
            <q-icon
              :name="queueInfo.Status === 'ENABLED' ? 'check_circle' : 'cancel'"
              :color="queueInfo.Status === 'ENABLED' ? 'green' : 'red'"
            >
            </q-icon>
            {{ queueInfo.Name }}
          </p>
          <p class="no-margin text-body2">
            {{ queueInfo.Description }}
          </p>
          <p class="no-margin text-subtitle1">
            <span class="text-bold">
              Hours of Operations:
            </span>
            {{ hoursOfOperation.Name }}
          </p>
        </div>
      </div>
  </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, DescribeQueueCommand, DescribeHoursOfOperationCommand } from '@aws-sdk/client-connect'
import getQueues from '../assets/GetQueues'
import { useInstanceStore } from '../stores/instance'

const instanceStore = useInstanceStore()

const queues = ref([])
const queueInfo = ref(null)
const creds = ref({})
const hoursOfOperation = ref(null)

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      queues.value = await getQueues(credentials)
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function GetQueueInfo (queue) {
  const client = new ConnectClient({
    region: 'us-east-1',
    credentials: creds.value
  })

  const input = {
    InstanceId: instanceStore.Id,
    QueueId: queue.Id
  }

  const command = new DescribeQueueCommand(input)

  try {
    const DescribeQueueResponse = await client.send(command)
    console.log(DescribeQueueResponse)
    queueInfo.value = DescribeQueueResponse.Queue

    try {
      const input = { // Get Specific Details on Hours of Operations Assigned to Queue
        InstanceId: instanceStore.Id,
        HoursOfOperationId: queueInfo.value.HoursOfOperationId
      }
      const command = new DescribeHoursOfOperationCommand(input)
      const DescribeHoursOfOperationResponse = await client.send(command)
      hoursOfOperation.value = DescribeHoursOfOperationResponse.HoursOfOperation
    } catch (error) {
      console.log('Error retrieving HOO details: ', error)
    }
  } catch (error) {
    console.log('Error retrieving queue list: ', error)
  }
}

</script>

<style lang="scss" scoped>

</style>
