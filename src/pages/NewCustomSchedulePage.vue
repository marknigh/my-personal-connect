<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <div class="col">
        <q-input filled dense outlined v-model="schedule.title" label="Title" />
      </div>
      <div class="col">
        <q-input filled dense outlined v-model="schedule.description" label="Description" />
      </div>
      <div class="col">
        <q-input filled dense outlined v-model="schedule.timezone" label="TimeZone" />
      </div>
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
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
// import daysOfWeekNames from '../assets/DaysOfWeekNames'
import CustomScheduleTimeSlots from '../components/CustomScheduleTimeSlots.vue'
import DefaultSchedule from '../assets/DefaultSchedule'

const schedule = ref(DefaultSchedule)

function entryChangeSave (scheduleEntryObject) {
  // find dow via the config array
  const index = schedule.value.config.findIndex((element) => {
    return (element.dow === scheduleEntryObject.dowIndex)
  })
  // find entry element via the entries array. Since the add entry will push a new element. No new push on a entry change
  schedule.value.config[index].entries.splice(scheduleEntryObject.entryIndex, 1)
  schedule.value.config[index].entries.push(scheduleEntryObject)
  console.log(schedule.value)
}

function RemoveEntry (entryObject) {
  // find dow of week in schedule config array
  const dowElement = schedule.value.config.find((element) => {
    return (element.dow === entryObject.dowIndex)
  })

  // remove element from dow.entries array via splice
  dowElement.entries.splice(entryObject.entryIndex, 1)
}

function addEntry (dowIndex) {
  // find the Day of Week in the Config Array
  const dowElement = schedule.value.config.find((element) => {
    return (element.dow === dowIndex.dowIndex)
  })

  dowElement.entries.push(
    {
      entryIndex: dowElement.entries.length,
      open: true,
      startTime: '08:00',
      endTime: '17:00'
    }
  )
}
</script>

<style lang="scss" scoped>

</style>
