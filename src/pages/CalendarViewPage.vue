<template>
  <q-page padding>
    <div class="row">
      <div class="col-2">
        <q-select options-dense dense filled v-model="selectedHOO" :options="hoursOOList" option-label="name" label="Hours of Operations" @update:model-value="getHOODetails()" />
      </div>
    </div>
    <q-separator spaced="md" color="yellow" style="width: 90%"/>
    <div v-if="selectedHOO" style="padding: 16px; display: flex; max-width: 1000px; width: 100%; height: 575px;">
      <q-calendar-resource
        ref="calendar"
        v-model="selectedDate"
        v-model:model-resources="resources"
        resource-key="id"
        resource-label="name"
        :interval-start="6"
        :interval-count="24"
        animated
        bordered
      >
        <template #resource-intervals="{ scope }">
          <template v-for="(event, index) in getEvents(scope)" :key="index" >
            <q-badge
              color="primary"
              :label="event.title"
              :style="getStyle(event)"
            />
          </template>
        </template>
      </q-calendar-resource>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, DescribeHoursOfOperationCommand, ListHoursOfOperationsCommand } from '@aws-sdk/client-connect'
import { QCalendarResource, today } from '@quasar/quasar-ui-qcalendar/src/QCalendarResource.js'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarResource.sass'
import DayOfWeekNumeric from '../assets/DayOfWeekNumeric'
import CreateTimeString from '../assets/CreateTimeString'
import CreateDurationTime from '../assets/CreateDurationTime'
import daysOfWeekNames from '../assets/DaysOfWeekNames'
import { useInstanceStore } from '../stores/instance'

const instanceStore = useInstanceStore()
const selectedDate = ref(today())
const creds = ref()
const selectedHOO = ref(null)
const resources = ref(daysOfWeekNames)
const hoursOOList = ref([])
const hOODetails = ref()

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      getHoursOfOperations()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function getHoursOfOperations () {
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
      hoursOOList.value.push({ name: element.Name, id: element.Id })
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
    InstanceId: 'b2f6e7d8-2ce4-4ce7-b641-88761ccb7b2e',
    HoursOfOperationId: selectedHOO.value.id
  }

  const command = new DescribeHoursOfOperationCommand(input)

  try {
    const response = await client.send(command)
    hOODetails.value = response.HoursOfOperation.Config
    console.log(hOODetails.value)
    // add DOW, start time from start object and calculate duration to hOODetails array
    hOODetails.value.forEach((day) => {
      day.dow = DayOfWeekNumeric(day)
      day.duration = CreateDurationTime(day)
      day.start = CreateTimeString(day)
    })
  } catch (error) {
    console.log('Error retrieving hours of operation list: ', error)
  }
}

function getEvents (scope) {
  const events = []
  const resourceEvents = hOODetails.value.filter((element) => element.Day.toLowerCase() === scope.resource.name.toLowerCase())
  for (let x = 0; x < resourceEvents.length; ++x) {
    events.push({
      left: scope.timeStartPosX(resourceEvents[x].start),
      width: scope.timeDurationWidth(resourceEvents[x].duration),
      title: resourceEvents[x].type
    })
  }
  return events
}

function getStyle (event) {
  return {
    position: 'absolute',
    background: 'primary',
    left: event.left + 'px',
    width: event.width + 'px'
  }
}

</script>

<style lang="scss" scoped>

</style>
