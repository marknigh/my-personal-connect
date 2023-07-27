<template>
  <q-page padding>
    <div class="row q-gutter-xl">
      <div class="col">
        <q-select options-dense dense filled v-model="selectedHOO" :options="hoursOO" option-label="name" label="Hours of Operations" @update:model-value="getHOODetails()" />
      </div>
      <!-- <div class="col">
        <q-input disable filled dense outlined v-model="hoursOfOperation.Name" label="Name" />
      </div> -->
      <div class="col">
        <q-input disable filled dense outlined v-model="hoursOfOperation.Description" label="Description" />
      </div>
      <div class="col">
        <q-input disable filled dense outlined v-model="hoursOfOperation.TimeZone" label="TimeZone" />
      </div>
    </div>
      <template v-for="dayObject in hoursOfOperation.Config" :key="dayObject.Day">
        <div class="row">
          <div class="col-1 self-center">
            <p class="text-subtitle2">{{ dayObject.Day }}</p>
          </div>
            <div class="col-3">
              <start-time-picker :day="dayObject.Day" :startTime="dayObject.StartTime" @time-change="timeChange"></start-time-picker>
            </div>
            <div class="col-3">
              <end-time-picker :day="dayObject.Day" :endTime="dayObject.EndTime" @time-change="timeChange"></end-time-picker>
            </div>
        </div>
      </template>
      <template v-if="hoursOfOperation.Config">
        <q-btn color="primary" icon="check" label="Submit" @click="Submit" />
      </template>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, ListHoursOfOperationsCommand, DescribeHoursOfOperationCommand, UpdateHoursOfOperationCommand } from '@aws-sdk/client-connect'
import StartTimePicker from '../components/StartTimePicker.vue'
import EndTimePicker from '../components/EndTimePicker.vue'

const hoursOO = ref([])
const selectedHOO = ref(null)
// const hoursOOInfo = ref({})
const creds = ref({})
// const nextToken = ref()

const hoursOfOperation = ref({})

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      // console.log('currentCredentials: ', credentials)
      creds.value = credentials
      getHOO()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function timeChange (day, time, type) {
  // find day in current list
  const dayConfig = hoursOfOperation.value.Config.find(element => element.Day === day)

  const formattedTime = { hours: Number(time.slice(0, 2)), minutes: Number(time.slice(3)) }

  switch (type) {
    case 'end':
      dayConfig.EndTime = { Hours: Number(formattedTime.hours), Minutes: Number(formattedTime.minutes) }
      break
    case 'start':
      break
    default:
      console.log('error on type')
  }
}

async function Submit () {
  debugger
  const credentials = {
    accessKeyId: creds.value.accessKeyId,
    secretAccessKey: creds.value.secretAccessKey,
    sessionToken: creds.value.sessionToken
  }

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials
  })
  debugger
  const input = { // ListQueuesRequest
    InstanceId: process.env.INSTANCEID,
    HoursOfOperationId: hoursOfOperation.value.HoursOfOperationId,
    Config: [hoursOfOperation.value.Config]
  }

  const command = new UpdateHoursOfOperationCommand(input)

  try {
    const response = await client.send(command)
    console.log(response)
  } catch (error) {
    console.log('Error saving Hours Of Operation Data: ', error)
  }
}

async function getHOO () {
  const credentials = {
    accessKeyId: creds.value.accessKeyId,
    secretAccessKey: creds.value.secretAccessKey,
    sessionToken: creds.value.sessionToken
  }

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials
  })
  // debugger
  const input = {
    InstanceId: process.env.INSTANCEID
  }

  const command = new ListHoursOfOperationsCommand(input)

  try {
    const response = await client.send(command)
    response.HoursOfOperationSummaryList.forEach((element) => {
      hoursOO.value.push({ name: element.Name, id: element.Id })
    })
  } catch (error) {
    console.log('Error retrieving hours of operation list: ', error)
  }
}

async function getHOODetails () {
  const credentials = {
    accessKeyId: creds.value.accessKeyId,
    secretAccessKey: creds.value.secretAccessKey,
    sessionToken: creds.value.sessionToken
  }

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials
  })
  // debugger
  const input = {
    InstanceId: process.env.INSTANCEID,
    HoursOfOperationId: selectedHOO.value.id
  }

  const command = new DescribeHoursOfOperationCommand(input)

  try {
    const response = await client.send(command)
    hoursOfOperation.value = response.HoursOfOperation
  } catch (error) {
    console.log('Error retrieving hours of operation list: ', error)
  }
}

</script>

<style lang="scss" scoped>

</style>
