<template>
  <q-page padding>
      <div class="row q-gutter-sm">
        <div class="col-2">
          <q-input ref="titleRef" stack-label filled dense outlined v-model="holiday.title" label="Title" lazy-rules="ondemand" :rules="[val => !!val || 'Title is Required']" />
        </div>
        <div class="col-4">
          <q-input stack-label filled dense outlined v-model="holiday.description" label="Description" />
        </div>
      </div>
      <q-separator spaced="md" color="yellow" style="width: 55%"/>
      <template v-for="(day, index) in holiday.dates" :key="day.id">
        <holiday-entry
          ref="holidayEntryRef"
          :day="day"
          :index="index"
          @addEntry="addEntry"
          @removeEntry="removeEntry"
          @dateChange="dateChange"
          @nameChange="nameChange"
        />
      </template>
      <q-separator spaced="md" color="yellow" style="width: 55%"/>
      <div class="row">
        <div class="q-mr-md">
          <q-btn color="primary" :label="editing ? 'update' : 'save'" @click="submitHoliday" />
        </div>
        <div class="q-mr-md">
          <q-btn color="negative" label="cancel" @click="cancel" />
        </div>
      </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { Auth } from 'aws-amplify'
import HolidayEntry from '../components/HolidayEntry.vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const holiday = ref({
  title: '',
  description: '',
  dates: [
    {
      id: Date.now(),
      name: '',
      date: ''
    }
  ]
})
const titleRef = ref(null)
const holidayEntryRef = ref(null)
const editing = ref(false)

getHolidayScheduleDetails()

async function getHolidayScheduleDetails () {
  if (route.params.holidayId) {
    editing.value = true
    const config = {
      url: (process.env.DEV ? process.env.DEV_URL : process.env.PROD_URL) + '/mpc/holidays/holiday',
      'X-Amz-Date': '',
      maxBodyLength: Infinity,
      headers: {
        Authorization: `Bearer ${((await Auth.currentSession()).getIdToken().getJwtToken())}`
      },
      params: { HolidayId: route.params.holidayId }
    }
    axios.request(config).then((response) => {
      holiday.value = response.data.Items[0]
    }).catch((err) => {
      console.log(err)
    })
  }
}
function addEntry () {
  holiday.value.dates.push({ id: Date.now() })
}

function removeEntry (index) {
  console.log('index: ', index)
  holiday.value.dates.splice(index, 1)
}

function cancel () {
  router.push({ path: '/holidays' })
}

function dateChange (date, id) {
  console.log('EntryChange: date, index: ', date, id)
  const dateIndex = holiday.value.dates.findIndex((element) => {
    return element.id === id
  })
  holiday.value.dates[dateIndex].date = new Date(date)
}

function nameChange (name, id) {
  console.log('nameChange: ', name, id)
  const dateIndex = holiday.value.dates.findIndex((element) => {
    return element.id === id
  })
  holiday.value.dates[dateIndex].name = name
}

async function submitHoliday () {
  console.log('submitHOliday')
  // validate the title field.
  if (titleRef.value.validate()) {
    // validate all child for both Name
    if (holidayEntryRef.value.every((element) => {
      return element.holidayNameRef.validate()
    })) {
    // validate all child for Date
      if (holidayEntryRef.value.every((element) => {
        return element.holidayDateRef.validate()
      })) {
        // submit holiday
        const config = {
          method: editing.value ? 'PUT' : 'POST',
          url: (process.env.DEV ? process.env.DEV_URL : process.env.PROD_URL) + '/mpc/holidays/holiday',
          'X-Amz-Date': '',
          maxBodyLength: Infinity,
          headers: {
            Authorization: `Bearer ${((await Auth.currentSession()).getIdToken().getJwtToken())}`
          },
          data: holiday.value
        }

        axios.request(config).then((response) => {
          console.log(response)
        }).catch((err) => {
          console.log(err)
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
