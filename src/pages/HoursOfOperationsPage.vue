<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <div class="col-2">
        <q-select options-dense dense filled v-model="selectedHOO" :options="hoursOO" option-label="name" label="Hours of Operations" @update:model-value="getHOODetails()" />
      </div>
      <div class="col-3">
        <q-input disable filled dense outlined v-model="hoursOfOperation.Description" label="Description" />
      </div>
      <div class="col-2">
        <q-input disable filled dense outlined v-model="hoursOfOperation.TimeZone" label="TimeZone" />
      </div>
    </div>
    <q-separator v-if="hoursOfOperation.Config" spaced="xl" color="yellow" style="width: 65%"/>
      <template v-for="dayObject in hoursOfOperation.Config" :key="dayObject.Day">
        <div class="row">
          <div class="col-1 self-center">
            <p class="text-subtitle2">{{ dayObject.Day }}</p>
          </div>
            <div class="col-3">
              <start-time-picker
                :day="dayObject.Day"
                :startTime="dayObject.StartTime"
                @time-change="timeChange"
              />
            </div>
            <div class="col-3">
              <end-time-picker
                :day="dayObject.Day"
                :endTime="dayObject.EndTime"
                @time-change="timeChange"
              />
            </div>
        </div>
      </template>
      <q-separator v-if="hoursOfOperation.Config" spaced="xl" color="yellow" style="width: 55%"/>
      <template v-if="hoursOfOperation.Config">
        <div class="row">
          <div class="q-mr-md">
            <q-btn color="primary" label="Submit" @click="Submit" />
          </div>
          <div class="q-mr-md">
            <q-btn color="red" label="Cancel" @click="Cancel" />
          </div>
        </div>
      </template>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Auth } from 'aws-amplify'
import { ConnectClient, ListHoursOfOperationsCommand, DescribeHoursOfOperationCommand, UpdateHoursOfOperationCommand } from '@aws-sdk/client-connect'
import StartTimePicker from '../components/StartTimePicker.vue'
import EndTimePicker from '../components/EndTimePicker.vue'
import { useInstanceStore } from '../stores/instance'

const router = useRouter()
const instanceStore = useInstanceStore()

const hoursOO = ref([])
const selectedHOO = ref(null)
const creds = ref({})
const sorter = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
}
const hoursOfOperation = ref({})

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
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
      dayConfig.StartTime = { Hours: Number(formattedTime.hours), Minutes: Number(formattedTime.minutes) }
      break
    default:
      console.log('error on type')
  }
}

async function Submit () {
  const credentials = {
    accessKeyId: creds.value.accessKeyId,
    secretAccessKey: creds.value.secretAccessKey,
    sessionToken: creds.value.sessionToken
  }

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials
  })

  const input = { // ListQueuesRequest
    InstanceId: instanceStore.Id,
    HoursOfOperationId: hoursOfOperation.value.HoursOfOperationId,
    Config: hoursOfOperation.value.Config
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
  const input = {
    InstanceId: instanceStore.Id
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

  const input = {
    InstanceId: instanceStore.Id,
    HoursOfOperationId: selectedHOO.value.id
  }

  const command = new DescribeHoursOfOperationCommand(input)

  try {
    const response = await client.send(command)
    hoursOfOperation.value = response.HoursOfOperation
  } catch (error) {
    console.log('Error retrieving hours of operation list: ', error)
  }
  // sort hoursOfOperation.Config array for Sunday to Saturday
  hoursOfOperation.value.Config.sort((a, b) => {
    const day1 = a.Day.toLowerCase()
    const day2 = b.Day.toLowerCase()
    return sorter[day1] - sorter[day2]
  })
}

function Cancel () {
  router.push('/')
}
</script>

<style lang="scss" scoped>

</style>
