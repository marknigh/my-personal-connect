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

          <q-item v-for="queue in queues" :key="queue.id" clickable v-ripple @click="GetQueueInfo(queue)">

            <q-item-section>
              <q-item-label lines="1">{{ queue.Name }}</q-item-label>
              <q-item-label caption>{{ formatDate(queue.LastModifiedTime) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-avatar
                size="sm"
                round
                text-color="white"
                :color="queue.QueueType === 'STANDARD' ? 'primary' : 'warning'"
              >
              {{ queue.QueueType.substring(0, 1) }}
            </q-avatar>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <q-separator spaced vertical color="black" style="height: 500px"/>
      <div class="col-5">
        <div class="row">

          <div v-if="queueInfo">
            <p class="no-margin text-h5 text-bold">
              <q-btn size="md" round flat color="primary" icon="o_analytics" @click="QueueAnalytics(queueInfo.QueueId)"/>
              {{ queueInfo.Name }}
              <q-badge
                rounded
                align="top"
                text-color="white"
                :color="queueInfo.Status === 'ENABLED' ? 'positive' : 'warning'"
                :label="queueInfo.Status === 'ENABLED' ? '&#10003;' : '&#10005;'"
              >
              </q-badge>
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
  </div>
  </q-page>
</template>

<script setup>
import { date } from 'quasar'
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, DescribeQueueCommand, DescribeHoursOfOperationCommand } from '@aws-sdk/client-connect'
import getQueues from '../assets/GetQueues'
import { useInstanceStore } from '../stores/instance'
import { useRouter } from 'vue-router'

const instanceStore = useInstanceStore()
const router = useRouter()

const queues = ref([])
// const agentQueues = ref(false)
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

function formatDate (queueDateTime) {
  return date.formatDate(queueDateTime, 'MMM Do, YYYY HH:MM')
}

async function GetQueueInfo (queue) {
  queueInfo.value = {}
  const client = new ConnectClient({
    region: 'us-east-1',
    credentials: creds.value
  })

  const input = {
    InstanceId: instanceStore.Id,
    QueueId: queue.Id
  }

  try {
    const DescribeQueueResponse = await client.send(new DescribeQueueCommand(input))
    console.log('DescribeQueueResponse: ', DescribeQueueResponse)
    queueInfo.value = DescribeQueueResponse.Queue

    try {
      const input = { // Get Specific Details on Hours of Operations Assigned to Queue
        InstanceId: instanceStore.Id,
        HoursOfOperationId: queueInfo.value.HoursOfOperationId
      }
      const DescribeHoursOfOperationResponse = await client.send(new DescribeHoursOfOperationCommand(input))
      console.log('DescribeHoursOfOperationResponse: ', DescribeHoursOfOperationResponse)
      hoursOfOperation.value = DescribeHoursOfOperationResponse.HoursOfOperation
    } catch (error) {
      console.log('Error retrieving HOO details: ', error)
    }
  } catch (error) {
    console.log('Error retrieving queue list: ', error)
  }
}

function QueueAnalytics (queueId) {
  router.push({ name: 'queue_analystics', params: { queueId } })
}
</script>

<style lang="scss" scoped>

</style>
