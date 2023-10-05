<template>
  <template v-if="!loading">
    <q-page padding>
      <q-list padding>
        <q-toolbar>
            <q-toolbar-title>
              Call Flows
            </q-toolbar-title>
          </q-toolbar>
        <template v-for="(flow) in contactFlowsList" :key="flow.Id">
            <q-item>
              <q-item-section avatar>
                <q-avatar size="sm"
                  :color="flow.ContactFlowState == 'ACTIVE' ? 'green' : 'red'"
                  :icon="flow.ContactFlowState == 'ACTIVE' ? 'notifications_active' : 'notifications_off'"
                  text-color="black"
                />
              </q-item-section>
              <q-item-section>{{ flow.Name }}</q-item-section>
              <q-item-section>{{ flow.ContactFlowType }}</q-item-section>
              <q-item-section v-if="flow.ContactFlowType == 'CONTACT_FLOW'">
                <template v-for="(flowSchedule, index) in flowScheduleList" :key="index">
                  <template v-if="flowSchedule.flowId === flow.Id">
                    <call-flow-edit-schedule
                      :flow-id="flow.Id"
                      :flow-schedule="flowSchedule"
                      :custom-schedule-list="customScheduleList"
                    />
                  </template>
                </template>
              </q-item-section>
            </q-item>
        </template>
        </q-list>
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
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import axios from 'axios'
import { ConnectClient, ListContactFlowsCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'
import CallFlowEditSchedule from 'src/components/CallFlowEditSchedule.vue'

const instanceStore = useInstanceStore()

const contactFlowsList = ref([])
const creds = ref({})
const flowScheduleList = ref([])
const customScheduleList = ref([])
const loading = ref(true)

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
    contactFlowsList.value = ListContactFlowsResponse.ContactFlowSummaryList
  } catch (error) {
    console.log('Error retrieving contact flow list: ', error)
  }
}

async function getFlowScheduleList () {
  const config = {
    url: (process.env.DEV ? process.env.DEV_URL : process.env.PROD_URL) + '/mpc/flowschedule/flows',
    'X-Amz-Date': '',
    maxBodyLength: Infinity,
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

</script>

<style lang="scss" scoped>

</style>
