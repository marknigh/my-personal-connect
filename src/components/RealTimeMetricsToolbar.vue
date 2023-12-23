<template>
  <div class="row">
    <q-toolbar class="col-4">
      <q-space />
    </q-toolbar>
    <q-toolbar class="col-8 q-col-gutter-md">
      <q-space />
        <div class="col-3">
          <q-select dense v-model="selectedQueue" label="Queue" :options="queues" option-label="Name" @update:model-value="QueueDelayChange()"></q-select>
        </div>
        <div class="col-2">
          <q-select dense v-model="selectedDelay" :options="secondOptions" label="Delay" @update:model-value="QueueDelayChange()"/>
        </div>
    </q-toolbar>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['queueDelayChange'])
defineProps(['queues'])

const selectedQueue = ref()
const secondOptions = [
  {
    label: '1 second',
    value: 1000
  },
  {
    label: '5 second',
    value: 5000
  },
  {
    label: '10 second',
    value: 10000
  }
]
const selectedDelay = ref(secondOptions[1])

function QueueDelayChange () {
  // console.log(selectedQueue.value, selectedDelay.value)
  emit('queueDelayChange', selectedQueue.value.Id, selectedDelay.value.value)
}

</script>

<style lang="scss" scoped>

</style>
