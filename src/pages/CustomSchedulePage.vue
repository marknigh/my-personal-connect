<template>
  <q-page padding>
    <div v-if="loading">
      <q-spinner-cube
        color="primary"
        size="xl"
      />
    </div>
    <template v-if="!loading">
      <div class="row q-gutter-sm">
        <div class="col">
          <q-input filled dense outlined v-model="schedule.title" label="Title" />
        </div>
        <div class="col">
          <q-input filled dense outlined v-model="schedule.description" label="Description" />
        </div>
        <!-- Implement TimeZone funcationality at a later date.  -->
        <!-- <div class="col">
          <q-input filled dense outlined v-model="schedule.timezone" label="TimeZone" />
        </div> -->
      </div>
      <q-separator spaced="md" color="yellow" style="width: 100%"/>
      <template v-for="(dow, index) in schedule.config" :key="index">
        <custom-schedule-time-slots
          :dow="dow"
          @entry-change="entryChangeSave"
          @remove-entry="RemoveEntry"
          @add-entry="addEntry"
        />
      </template>
      <q-separator spaced="md" color="yellow" style="width: 100%"/>
      <div class="row">
        <div class="q-mr-md">
          <q-btn color="primary" :label="editing ? 'update' : 'save'" @click="submitSchedule" />
        </div>
        <div class="q-mr-md">
          <q-btn color="red" label="cancel" @click="Cancel" />
        </div>
        <div class="q-mr-md">
          <q-btn v-if="editing" flat label="delete" @click="DeleteSchedule" />
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import axios from 'axios'
import { Auth } from 'aws-amplify'
import { useRoute, useRouter } from 'vue-router'
import CustomScheduleTimeSlots from '../components/CustomScheduleTimeSlots.vue'
import DefaultSchedule from '../assets/DefaultSchedule'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const loading = ref(true)
const schedule = ref(DefaultSchedule)
const editing = ref(false)

GetScheduleInfo()

function DeleteSchedule () {
  $q.dialog({
    title: 'Delete Schedule',
    message: 'Type \'delete\' ',
    prompt: {
      isValid: val => val === 'delete'
    },
    cancel: true,
    persistent: true
  }).onOk(data => {
    console.log('>>>> OK, received', data)
  })
}

function Cancel () {
  // clear out the schedule
  schedule.value = {}

  router.push({ path: '/customschedules' })
}

async function GetScheduleInfo () {
  if (route.params.schedule) {
    editing.value = true
    const config = {
      url: (process.env.DEV ? process.env.DEV_URL : process.env.PROD_URL) + '/mpc/schedule/item',
      'X-Amz-Date': '',
      maxBodyLength: Infinity,
      headers: {
        Authorization: `Bearer ${((await Auth.currentSession()).getIdToken().getJwtToken())}`
      },
      params: { scheduleId: route.params.schedule }
    }
    axios.request(config).then((response) => {
      schedule.value = response.data.Items[0]
    }).catch((err) => {
      console.log(err)
    })
  }
  loading.value = false
}

function entryChangeSave (scheduleEntryObject) {
  // find dow via the config array.
  const index = schedule.value.config.findIndex((element) => {
    return (element.dow === scheduleEntryObject.dowIndex)
  })

  // find the element of the entries array
  schedule.value.config[index].entries.splice(scheduleEntryObject.entryIndex, 1, scheduleEntryObject)
  // schedule.value.config[index].entries.push(scheduleEntryObject)
  console.log(schedule.value)
}

function RemoveEntry (entryObject) {
  // find dow of week in schedule config array
  const dowElement = schedule.value.config.find((element) => {
    return (element.dow === entryObject.dowIndex)
  })

  // find the correct entry based on entryIndex
  const entryIndex = dowElement.entries.findIndex((element) => {
    return element.entryIndex === entryObject.entryIndex
  })

  // remove element from dow.entries array via splice
  dowElement.entries.splice(entryIndex, 1)
}

function addEntry (dowIndex) {
  // find the Day of Week in the Config Array
  const dowElement = schedule.value.config.find((element) => {
    return (element.dow === dowIndex.dowIndex)
  })

  dowElement.entries.push(
    {
      dowIndex: dowElement.dow,
      // make sure entry has an index that doesn't duplicate for the given day
      entryIndex: findHighestIndex(dowElement) + 1,
      open: true,
      startTime: '08:00',
      endTime: '17:00'
    }
  )
}

function findHighestIndex (dowElement) {
  const justEntryIndexes = dowElement.entries.map((element) => { return element.entryIndex })
  return Math.max(...justEntryIndexes)
}

async function submitSchedule () {
  console.log((await Auth.currentSession()).getIdToken().getJwtToken())
  console.log(schedule.value)

  // new schedule or updating
  const method = editing.value ? 'PUT' : 'POST'
  const config = {
    method,
    url: (process.env.DEV ? process.env.DEV_URL : process.env.PROD_URL) + '/mpc/schedule',
    'X-Amz-Date': '',
    maxBodyLength: Infinity,
    headers: {
      Authorization: `Bearer ${((await Auth.currentSession()).getIdToken().getJwtToken())}`
    },
    data: schedule.value
  }

  if (editing.value) { config.params = { scheduleId: schedule.value.ScheduleId } }

  axios.request(config).then((response) => {
    $q.notify(
      {
        type: 'positive',
        message: 'Your Schedule Has Been ' + editing.value ? 'Updated' : 'Saved'
      }
    )
  }).catch((err) => {
    console.log(err)
  })
}
</script>

<style lang="scss" scoped>

</style>
