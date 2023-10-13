<template>
  <template v-if="!loading">
    <q-table
      flat bordered
      title="Call Flows"
      :rows="filterContactFlowsList"
      :columns="columns"
      row-key="Id"
      :rows-per-page-options="[10, 20]"
    >
      <template v-slot:top>
        <div class="col-2">
          <p class="text-h6">Call Flows</p>
        </div>
        <q-space />
        <div class="col-3">
          <q-input dense bottom-slots v-model="inputFlowFilter" debounce="500">
            <template #hint>
              Filter by Name - lowercase
            </template>
          </q-input>
        </div>
      </template>
      <template #body="props">
        <q-tr no-hover :props="props">
          <q-td key="state" :props="props" @click="getCallFlowDetails(props.row)">
            <q-icon
              size="xs"
              :color="props.row.ContactFlowState == 'ACTIVE' ? 'green' : 'red'"
              :name="props.row.ContactFlowState == 'ACTIVE' ? 'notifications_active' : 'notifications_off'"
            />
          </q-td>
          <q-td key="name" :props="props">
            {{ props.row.Name }}
          </q-td>
          <q-td key="status" :props="props">
            <q-icon
              size="xs"
              color="primary"
              :name="props.row.Status == 'published' ? 'menu_book' : 'save_as'"
            />
          </q-td>
          <q-td key="type" :props="props">
            {{ props.row.ContactFlowType }}
          </q-td>
          <q-td key="schedule" :props="props">
            <template v-for="(flowSchedule, index) in flowScheduleList" :key="index">
              <template v-if="flowSchedule.flowId === props.row.Id">
                <call-flow-edit-schedule
                  :flow-id="props.row.Id"
                  :flow-schedule="flowSchedule"
                  :custom-schedule-list="customScheduleList"
                  />
                </template>
              </template>
            </q-td>
        </q-tr>
      </template>

      <template #bottom-row>
        <q-tr>
          <q-td colspan="100%">
            *Click state icon of row to view/edit prompts
          </q-td>
        </q-tr>
      </template>
    </q-table>
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
import { ref, onMounted, watch } from 'vue'
import { Auth } from 'aws-amplify'
import axios from 'axios'
import { ConnectClient, ListContactFlowsCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'
import CallFlowEditSchedule from 'src/components/CallFlowEditSchedule.vue'
import { useRouter } from 'vue-router'

const instanceStore = useInstanceStore()
const router = useRouter()

const contactFlowsList = ref([])
const filterContactFlowsList = ref([])
const creds = ref({})
const flowScheduleList = ref([])
const customScheduleList = ref([])
const loading = ref(true)
const inputFlowFilter = ref(null)
const columns = ref([
  {
    name: 'state',
    label: 'State',
    field: 'ContactFlowState',
    align: 'center'
  },
  {
    name: 'name',
    label: 'Call Flow Name',
    field: 'Name',
    align: 'left'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'Status',
    align: 'center'
  },
  {
    name: 'type',
    label: 'Contact Flow Type',
    field: 'ContactFlowType',
    align: 'left'
  },
  {
    name: 'schedule',
    label: 'Schedule Assigned',
    field: 'schedule',
    align: 'left'
  }
])

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      getContactFlowsList()
      getFlowScheduleList()
      getCustomScheduleList()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

watch(inputFlowFilter, (n, o) => {
  if (n === null) {
    return contactFlowsList.value
  } else {
    filterContactFlowsList.value = contactFlowsList.value.filter((element) => {
      return element.Name.toLowerCase().includes(n)
    })
  }
})

async function getContactFlowsList () {
  const client = new ConnectClient({
    region: 'us-east-1',
    credentials: creds.value
  })

  const input = {
    InstanceId: instanceStore.Id
  }

  try {
    const ListContactFlowsResponse = await client.send(new ListContactFlowsCommand(input))
    console.log('ListContactFlowsResponse.ContactFlowSummaryList', ListContactFlowsResponse.ContactFlowSummaryList)
    contactFlowsList.value = filterContactFlowsList.value = ListContactFlowsResponse.ContactFlowSummaryList
  } catch (error) {
    console.log('Error retrieving contact flow list: ', error)
  }
}

async function getFlowScheduleList () {
  const config = {
    url: (process.env.DEV ? process.env.DEV_URL : process.env.PROD_URL) + '/mpc/flowschedule/flows',
    headers: {
      Authorization: `Bearer ${((await Auth.currentSession()).getIdToken().getJwtToken())}`
    }
  }
  axios.request(config).then((response) => {
    response.data.Items.forEach((item) => {
      flowScheduleList.value.push(item)
    })
  }).catch((err) => {
    console.log(err)
  })
}

async function getCustomScheduleList () {
  const config = {
    url: (process.env.DEV ? process.env.DEV_URL : process.env.PROD_URL) + '/mpc/schedule/items',
    'X-Amz-Date': '',
    maxBodyLength: Infinity,
    headers: {
      Authorization: `Bearer ${((await Auth.currentSession()).getIdToken().getJwtToken())}`
    }
  }
  axios.request(config).then((response) => {
    response.data.Items.forEach((item) => {
      customScheduleList.value.push(item)
    })
    loading.value = false
  }).catch((err) => {
    console.log(err)
  })
}

function getCallFlowDetails (row) {
  router.push({ path: `contactflowdetails/${row.Id}` })
}

</script>

<style lang="scss" scoped>

</style>
