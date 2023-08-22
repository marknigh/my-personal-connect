<template>
  <q-page padding>
    <div class="row q-gutter-xl">
      <div class="col-3">
        <q-select v-model="selectedQueue" label="Queue" :options="queues" option-label="Name" @update:model-value="queueDelayChange()"></q-select>
      </div>
      <div class="col-2">
        <q-select v-model="selectedDelay" :options="secondOptions" label="Delay" @update:model-value="queueDelayChange()"/>
      </div>
    </div>
    <div v-if="selectedQueue" class="row">
      <div v-for="met in metrics" :key="met.id" class="col">
        <metric-cards :name="met.name" :value="met.value" :unit="met.unit"/>
      </div>
    </div>
  </q-page>
</template>

<script setup>
// Imports
import { Auth } from 'aws-amplify'
import { onMounted, ref, onUnmounted } from 'vue'
import { ConnectClient, GetCurrentMetricDataCommand } from '@aws-sdk/client-connect'
import getQueues from 'src/assets/GetQueues'
import MetricCards from '../components/MetricCards.vue'
import { useInstanceStore } from '../stores/instance'

const instanceStore = useInstanceStore()

// Vue Ref
const queues = ref([])
const selectedQueue = ref(null)
const creds = ref()
const metrics = ref([])
const timer = ref(null)
const secondOptions = [
  {
    label: '1 second',
    value: 1000
  },
  {
    label: '5 second',
    value: 5000
  },
  {
    label: '10 second',
    value: 10000
  }
]
const selectedDelay = ref(secondOptions[1])

// Vue Lifecycle Hooks
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

onUnmounted(() => {
  clearInterval(timer.value)
})

// Vue Methods
function queueDelayChange () {
  clearInterval(timer.value)
  metrics.value = []
  GetMetrics()
  timer.value = setInterval(() => {
    GetMetrics()
  }, selectedDelay.value.value)
}

async function GetMetrics () {
  metrics.value = []
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
    Filters: {
      Queues: [selectedQueue.value.Id],
      Channels: ['VOICE']
      // RoutingProfiles: ['Basic Routing Profile']
    },
    CurrentMetrics: [{
      Name: 'AGENTS_AVAILABLE',
      Unit: 'COUNT'
    },
    {
      Name: 'CONTACTS_IN_QUEUE',
      Unit: 'COUNT'
    },
    {
      Name: 'OLDEST_CONTACT_AGE',
      Unit: 'SECONDS'
    }]
  }

  const command = new GetCurrentMetricDataCommand(input)

  try {
    const response = await client.send(command)
    console.log('response: ', response)
    if (response.ApproximateTotalCount >= 1) {
      response.MetricResults[0].Collections.forEach((element) => {
        metrics.value.push({ name: element.Metric.Name, value: element.Value, unit: element.Metric.Unit })
      })
    } else {
      metrics.value.push({
        name: 'AGENTS_AVAILABLE',
        unit: 'COUNT',
        value: 0
      },
      {
        name: 'CONTACTS_IN_QUEUE',
        unit: 'COUNT',
        value: 0
      },
      {
        name: 'OLDEST_CONTACT_AGE',
        unit: 'SECONDS',
        value: 0
      })
    }
  } catch (error) {
    console.log('Error retrieving RT Metrics: ', error)
  }
}

</script>

<style lang="scss" scoped>

</style>
