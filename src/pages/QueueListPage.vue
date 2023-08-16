<template>
  <q-page padding>
    <div class="fit row wrap justify-evenly items-center content-center">
    <q-list separator>
      <q-item-label header>Queues</q-item-label>
      <q-item clickable v-ripple @click="GetQueueInfo(queue)" v-for="queue in queues" :key="queue.id">
        <q-item-section avatar top>
          <q-avatar icon="folder" :color="queue.QueueType = 'primary' ? 'primary' : 'accent'" text-color="white" />
        </q-item-section>

        <q-item-section>
          <q-item-label lines="1">{{ queue.Name }}</q-item-label>
          <q-item-label caption>{{ queue.QueueType }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-icon name="info" color="green" />
        </q-item-section>
      </q-item>
    </q-list>
    <q-separator spaced vertical color="black" style="height: 500px"/>
    <div class="col-5 row">
      <q-list v-if="queueInfo">
        <q-item-section>
          <q-item-label>
            <q-icon v-if="queueInfo.Status == 'ENABLED'" name="check_circle" color="green"></q-icon>
            {{ queueInfo.Name }}
          </q-item-label>
          <q-item-label caption> {{ queueInfo.Description }}</q-item-label>
          <q-item-label caption v-if="hoursOfOperation" @click="GetHOODetails"> <span class="text-bold">Hours Of Operations:</span> {{ hoursOfOperation.Name }}</q-item-label>
        </q-item-section>
      </q-list>
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

  const input = { // ListQueuesRequest
    InstanceId: instanceStore.Id,
    QueueId: queue.Id
  }

  const command = new DescribeQueueCommand(input)

  try {
    const DescribeQueueResponse = await client.send(command)
    queueInfo.value = DescribeQueueResponse.Queue

    try {
      const input = { // ListQueuesRequest
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

function GetHOODetails () {
  console.log('GetHOODetails')
}
</script>

<style lang="scss" scoped>

</style>
