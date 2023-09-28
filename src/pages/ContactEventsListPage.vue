<template>
  <template v-if="loading">
    <q-spinner
        color="primary"
        size="3rem"
        :thickness="5"
      />
  </template>
  <template v-if="!loading">
    <q-table
      flat
      title="Contacts"
      :rows="tableList"
      :columns="columns"
      :loading="loading"
      :rows-per-page-options="[25, 50, 75, 100]"
    >
      <!-- <template v-slot:body-cell-agentName="props">
        <q-td :props="props">
           {{ props.row.agentName }}
        </q-td>
      </template> -->
    </q-table>
  </template>
</template>

<script setup>
import { date } from 'quasar'
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import axios from 'axios'
import { ConnectClient, DescribeUserCommand, DescribeQueueCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'

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
    name: 'startTimestamp',
    label: 'Start Time',
    field: (row) => date.formatDate(row.initiationTimestamp, 'MM-DD-YYYY h:m:ss'),
    align: 'left'
  },
  {
    name: 'disconnectTimestamp',
    label: 'Disconnect Time',
    field: (row) => date.formatDate(row.disconnectTimestamp, 'MM-DD-YYYY h:m:ss'),
    align: 'left'
  },
  {
    name: 'agentName',
    label: 'Agent Name',
    field: 'agentInfo',
    align: 'left'
  },
  {
    name: 'queueName',
    label: 'Queue Name',
    field: 'queueInfo',
    align: 'left'
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
    field: (row) => {
      const day1 = new Date(row.disconnectTimestamp)
      const day2 = new Date(row.initiationTimestamp)
      return date.getDateDiff(day1, day2, 'seconds')
    },
    align: 'left'
  }
])
const tableList = ref([])

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

async function getContactEventsList () {
  const config = {
    url: (process.env.DEV ? process.env.DEV_URL : process.env.PROD_URL) + '/mpc/contacts/events',
    'X-Amz-Date': '',
    maxBodyLength: Infinity,
    headers: {
      Authorization: `Bearer ${((await Auth.currentSession()).getIdToken().getJwtToken())}`
    }
  }
  axios.request(config).then(async (response) => {
    // console.log('response: ', response)
    const contactEventsList = []
    response.data.Items.forEach((item) => {
      contactEventsList.push(item)
    })
    // group by contactId
    const contactEventsGroup = groupBy(contactEventsList, 'contactId')
    // considate all events with same ContactId to be displayed in qtable
    consolidateEvents(contactEventsGroup)
    console.log('consolidatedEvents has been called.')
  }).catch((err) => {
    console.log(err)
  }).finally(() => {
    loading.value = false
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
    console.log('value: ', value)
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
      }

      if (v.queueInfo) {
        // contactIdObj.agentInfo = element.agentInfo.connectedToAgentTimestamp
        contactIdObj.queueInfo = await getQueueName(v.queueInfo.queueArn)
      }
    }
    consolidate.push(contactIdObj)
    console.log(consolidate)
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
    console.log(DescribeQueueResponse)
    return DescribeQueueResponse.Queue.Name
  } catch (error) {
    console.log('Error retrieving user list: ', error)
  }
}
</script>

<style lang="scss" scoped>

</style>
