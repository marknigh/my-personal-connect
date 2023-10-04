<template>
  <template v-if="!loading">
    <q-page padding>
      <q-table
        flat
        title="Contacts"
        :rows="tableList"
        :columns="columns"
        :loading="loading"
        :rows-per-page-options="[25, 50, 75, 100]"
        row-key="contactId"
      >
      <template v-slot:top-right>
        <q-input ref="startDateRef" class="q-pa-xs" dense filled v-model="inputStartDate" label="Start Date" :rules="[val => !!val || 'Field is required']">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="startDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input ref="endDateRef" class="q-pa-xs" dense filled v-model="inputEndDate" label="End Date" :rules="endDateRules">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="endDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-slot:after>
            <q-icon name="search" color="blue" @click="searchContacts"/>
          </template>
        </q-input>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="contactId" :props="props">
            {{ props.row.contactId }}
          </q-td>
          <q-td key="initiationTimestamp" :props="props">
            {{ formatDateTime(props.row.initiationTimestamp) }}
          </q-td>
          <q-td key="disconnectTimestamp" :props="props">
            {{ formatDateTime(props.row.disconnectTimestamp) }}
          </q-td>
          <q-td key="agentInfo" :props="props">
            {{ props.row.agentInfo }}
          </q-td>
          <q-td key="queueInfo" :props="props">
            {{ props.row.queueInfo }}
          </q-td>
          <q-td key="recording" :props="props">
            <q-icon v-if="props.row.agentInfo" name="play_arrow" @click="props.expand = !props.expand"/>
          </q-td>
          <q-td key="channel" :props="props">
            {{ props.row.channel }}
          </q-td>
          <q-td key="duration" :props="props">
            {{ durationTime(props.row) }}
          </q-td>
        </q-tr>
        <q-tr v-if="props.expand" :props="props">
          <q-td colspan="100%">
            <play-recording
            :contactId="props.row.contactId"
            :agentConnectTimestamp="props.row.agentConnectTimestamp"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
  </template>
  <template v-else>
    <q-page class="flex flex-center">
      <q-circular-progress
          indeterminate
          size="75px"
          :thickness="0.6"
          color="primary"
          center-color="secondary"
          class="q-ma-md"
        />
      </q-page>
    </template>
</template>

<script setup>
import { date } from 'quasar'
import { ref, onMounted, computed } from 'vue'
import { Auth } from 'aws-amplify'
import axios from 'axios'
import { ConnectClient, DescribeUserCommand, DescribeQueueCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'
import PlayRecording from '../components/PlayRecording.vue'
const instanceStore = useInstanceStore()

const loading = ref(true)
const creds = ref(null)
const columns = ref([
  {
    name: 'contactId',
    label: 'Contact ID',
    field: 'contactId',
    align: 'left'
  },
  {
    name: 'initiationTimestamp',
    label: 'Start Time',
    field: 'initiationTimestamp',
    align: 'left'
  },
  {
    name: 'disconnectTimestamp',
    label: 'Disconnect Time',
    field: 'disconnectTimestamp',
    align: 'left'
  },
  {
    name: 'agentInfo',
    label: 'Agent Name',
    field: 'agentInfo',
    align: 'left'
  },
  {
    name: 'queueInfo',
    label: 'Queue Name',
    field: 'queueInfo',
    align: 'left'
  },
  {
    name: 'recording',
    label: 'Recording',
    field: 'recording',
    align: 'center'
  },
  {
    name: 'channel',
    label: 'Channel',
    field: 'channel',
    align: 'left'
  },
  {
    name: 'duration',
    label: 'Duration',
    field: 'duration',
    align: 'left'
  }
])
const tableList = ref([])
const startDate = ref(null)
const endDate = ref(null)
const startDateRef = ref()
const endDateRef = ref()

const inputStartDate = computed(() => {
  return date.formatDate(startDate.value, 'MM-DD-YYYY')
})

const inputEndDate = computed(() => {
  return date.formatDate(endDate.value, 'MM-DD-YYYY')
})

const endDateRules = [
  val => !!val || 'Field is required',
  val => (val >= inputStartDate.value) || 'Must be equal to or greater than Start Date'
]
onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      getContactEventsList()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

function formatDateTime (dateTime) {
  return date.formatDate(dateTime, 'MM-DD-YYYY hh:mm:ss a')
}

function durationTime (row) {
  const day1 = new Date(row.disconnectTimestamp)
  const day2 = new Date(row.initiationTimestamp)
  const seconds = date.getDateDiff(day1, day2, 'seconds')
  if (seconds > 60) {
    const minutes = Math.floor(seconds / 60)
    const extraSeconds = seconds % 60
    const formatSeconds = extraSeconds < 10 ? '0' + extraSeconds : extraSeconds
    return minutes + ':' + formatSeconds
  } else {
    return seconds
  }
}

async function getContactEventsList () {
  const config = {
    url: (process.env.DEV ? process.env.DEV_URL : process.env.PROD_URL) + '/mpc/contacts/events',
    'X-Amz-Date': '',
    maxBodyLength: Infinity,
    headers: {
      Authorization: `Bearer ${((await Auth.currentSession()).getIdToken().getJwtToken())}`
    }
  }
  axios.request(config).then((response) => {
    // console.log('response: ', response)
    const contactEventsList = []
    response.data.Items.forEach((item) => {
      contactEventsList.push(item)
    })
    // group by contactId
    const contactEventsGroup = groupBy(contactEventsList, 'contactId')
    // considate all events with same ContactId to be displayed in qtable
    consolidateEvents(contactEventsGroup)
  }).catch((err) => {
    console.log(err)
  })
}

// group all contactId into an object with the ContactId is the key and value is the array of events.
function groupBy (arr, property) {
  return arr.reduce((event, x) => {
    if (!event[x[property]]) { event[x[property]] = [] }
    event[x[property]].push(x)
    return event
  }, {})
}

async function consolidateEvents (arr) {
  const consolidate = []
  for (const [key, value] of Object.entries(arr)) {
    const contactIdObj = {
      contactId: key
    }
    for (const v of value) {
      contactIdObj.channel = v.channel
      contactIdObj.initiationTimestamp = v.initiationTimestamp
      if (v.disconnectTimestamp) { contactIdObj.disconnectTimestamp = v.disconnectTimestamp }

      if (v.agentInfo) {
        // contactIdObj.agentInfo = element.agentInfo.connectedToAgentTimestamp
        contactIdObj.agentInfo = await getAgentName(v.agentInfo.agentArn)
        contactIdObj.agentConnectTimestamp = v.agentInfo.connectedToAgentTimestamp
      }

      if (v.queueInfo) {
        // contactIdObj.agentInfo = element.agentInfo.connectedToAgentTimestamp
        contactIdObj.queueInfo = await getQueueName(v.queueInfo.queueArn)
      }
    }
    consolidate.push(contactIdObj)
  }
  tableList.value = consolidate
  loading.value = false
}

async function getAgentName (agentArn) {
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
    UserId: agentArn
  }

  const command = new DescribeUserCommand(input)

  try {
    const user = await client.send(command)
    return user.User.IdentityInfo.FirstName + ' ' + user.User.IdentityInfo.LastName
  } catch (error) {
    console.log('Error retrieving user list: ', error)
  }
}

async function getQueueName (queueArn) {
  const client = new ConnectClient({
    region: 'us-east-1',
    credentials: creds.value
  })

  const input = {
    InstanceId: instanceStore.Id,
    QueueId: queueArn
  }

  const command = new DescribeQueueCommand(input)

  try {
    const DescribeQueueResponse = await client.send(command)
    return DescribeQueueResponse.Queue.Name
  } catch (error) {
    console.log('Error retrieving user list: ', error)
  }
}

async function searchContacts () {
  if (startDateRef.value.validate() && endDateRef.value.validate()) {
    // convert startDate and endDate to yyyy-mm-dd format
    const start = startDate.value.replaceAll('/', '-')
    const end = endDate.value.replace('/', '-')

    const config = {
      url: (process.env.DEV ? process.env.DEV_URL : process.env.PROD_URL) + '/mpc/contacts/events/search',
      'X-Amz-Date': '',
      maxBodyLength: Infinity,
      headers: {
        Authorization: `Bearer ${((await Auth.currentSession()).getIdToken().getJwtToken())}`
      },
      params: { start, end }
    }
    axios.request(config).then((response) => {
      console.log('response: ', response)
      const contactEventsList = []
      response.data.Items.forEach((item) => {
        contactEventsList.push(item)
      })
      // group by contactId
      const contactEventsGroup = groupBy(contactEventsList, 'contactId')
      // considate all events with same ContactId to be displayed in qtable
      consolidateEvents(contactEventsGroup)
    }).catch((err) => {
      console.log(err)
    })
  }
}
</script>

<style lang="scss" scoped>

</style>
