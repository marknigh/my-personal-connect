<template>
    <div class="row">
      <div class="col-2">
        <div class="text-h6">{{ props.dow.dowName }}
            <q-icon size="xs" name="add" color="primary" @click="AddEntry">
            </q-icon>
          </div>
        </div>
      </div>

      <template v-for="(entry, index) in sortByIndex" :key="index">
        <start-end-time-input
          :entry="entry"
          @remove-entry="RemoveEntry"
        >
        <template #openslot>
            {{ entry.entryIndex }} {{  entry.dowIndex }}
            <q-checkbox v-model="entry.open" checked-icon="meeting_room" unchecked-icon="door_front" @update:model-value="EntryChange(entry)"/>
          </template>

          <template #startTime>
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time v-model="entry.startTime" @update:model-value="EntryChange(entry)">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </template>

          <template #endTime>
            <q-time v-model="entry.endTime" @update:model-value="EntryChange(entry)">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-time>
          </template>

        </start-end-time-input>
      </template>
</template>

<script setup>
import { computed } from 'vue'
import StartEndTimeInput from './StartEndTimeInput.vue'
const props = defineProps(['dow'])
const emit = defineEmits(['entryChange', 'removeEntry', 'addEntry'])

const sortByIndex = computed(() => {
  const newArray = [...props.dow.entries]
  return newArray.sort((a, b) => {
    return a.entryIndex - b.entryIndex
  })
})

function AddEntry () {
  // entriesPerDay.value.push({})
  emit('addEntry', {
    dowIndex: props.dow.dow
  })
}

function RemoveEntry (entryIndex) {
  // add dow index to emit chain
  const entryObject = {
    entryIndex,
    dowIndex: props.dow.dow
  }
  console.log('entryObject: ', entryObject)
  emit('removeEntry', entryObject)
}

function EntryChange (entry) {
  console.log('CustomScheduleTimeSlots => EntryChange: ', entry)
  const entryObject = {
    open: entry.open,
    startTime: entry.startTime,
    endTime: entry.endTime,
    dowIndex: entry.dowIndex,
    entryIndex: entry.entryIndex
  }
  console.log(entryObject)
  emit('entryChange', entryObject)
}

</script>

<style lang="scss" scoped>

</style>
