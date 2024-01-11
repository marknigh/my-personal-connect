<template>
  <q-page padding>
    <q-toolbar>
      <q-toolbar-title class="text-center">
        Real Time Metrics
      </q-toolbar-title>
    </q-toolbar>
    <template v-if="queues.length > 0">
      <real-time-metrics-toolbar :queues="queues" @queueDelayChange="queueDelayChange"/>
    </template>
    <div>
      <real-time-metrics-cards :metrics="metrics" icon-position="right"/>
    </div>
    <div>
    <q-toolbar>
      <q-toolbar-title class="text-center">
        Historical Charts
      </q-toolbar-title>
    </q-toolbar>
    <div class="row no-wrap">
      <real-time-metrics-total-contacts-chart />
      <real-time-metrics-total-abandon-chart />
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
import RealTimeMetricsCards from '../components/RealTimeMetricsCards.vue'
import { useInstanceStore } from '../stores/instance'
import RealTimeMetricsToolbar from 'src/components/RealTimeMetricsToolbar.vue'
import RealTimeMetricsTotalContactsChart from 'src/components/RealTimeMetricsTotalContactsChart.vue'
import RealTimeMetricsTotalAbandonChart from 'src/components/RealTimeMetricsTotalAbandonChart.vue'

// Vue Ref
const instanceStore = useInstanceStore()
const queues = ref([])
const creds = ref()
const metrics = ref(
  [{
    name: 'AGENTS_AVAILABLE',
    unit: 'COUNT',
    value: 0,
    color1: '#03A9F4',
    color2: '#3e51b5',
    icon: 'people',
    displayName: 'Agents Available'
  },
  {
    name: 'AGENTS_ON_CONTACT',
    unit: 'COUNT',
    value: 0,
    color1: '#AB47BC',
    color2: '#3e51b5',
    icon: 'mic',
    displayName: 'Agents On Call'
  },
  {
    name: 'AGENTS_NON_PRODUCTIVE',
    unit: 'COUNT',
    value: 0,
    color1: '#9FCC2E',
    color2: '#3e51b5',
    icon: 'workspaces',
    displayName: 'Agents Non Productive'
  },
  {
    name: 'CONTACTS_IN_QUEUE',
    unit: 'COUNT',
    value: 0,
    color1: '#FA9F1B',
    color2: '#3e51b5',
    icon: 'groups',
    displayName: 'Contacts In Queue'

  },
  {
    name: 'SLOTS_ACTIVE',
    unit: 'COUNT',
    value: 0,
    color1: '#25476A',
    color2: '#3e51b5',
    icon: 'handshake',
    displayName: 'Contacts Handled'

  },
  {
    name: 'OLDEST_CONTACT_AGE',
    unit: 'SECONDS',
    value: 0,
    color1: '#03A9F4',
    color2: '#3e51b5',
    icon: 'timer',
    displayName: 'Oldest Contacts in Queue'

  }]
)
const timer = ref(null)

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
function queueDelayChange (queue, delay) {
  clearInterval(timer.value)
  timer.value = setInterval(() => {
    GetMetrics(queue)
  }, delay)
}

async function GetMetrics (queue) {
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
      Queues: [queue],
      Channels: ['VOICE']
      // RoutingProfiles: ['Basic Routing Profile']
    },
    CurrentMetrics: [
      {
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
      },
      {
        Name: 'SLOTS_ACTIVE',
        Unit: 'COUNT'
      },
      {
        Name: 'AGENTS_ON_CONTACT',
        Unit: 'COUNT'
      },
      {
        Name: 'AGENTS_NON_PRODUCTIVE',
        Unit: 'COUNT'
      }
    ]
  }

  const command = new GetCurrentMetricDataCommand(input)

  try {
    const GetCurrentMetricDataResponse = await client.send(command)
    console.log('GetCurrentMetricDataResponse: ', GetCurrentMetricDataResponse)
    if (GetCurrentMetricDataResponse.ApproximateTotalCount >= 1) {
      GetCurrentMetricDataResponse.MetricResults[0].Collections.forEach((element) => {
        const metric = metrics.value.find((e) => element.Metric.Name === e.name)
        metric.value = element.Value
      })
    }
  } catch (error) {
    console.log('Error retrieving RT Metrics: ', error)
  }
}

</script>

<style lang="scss" scoped>

</style>
