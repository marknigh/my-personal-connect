<template>
  <div class="q-pa-md">
    <div class="q-gutter-sm row">
      <q-input dense filled v-model="qInputFormat">
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time v-model="qTimeFormat" @update:model-value="timeChange">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['endTime', 'day'])
const emit = defineEmits(['timeChange'])

// Amazon Connect sends hours and minutes in an object { Hours: x } where x < 10, as a single string. This function will add 0 in front of hours and minutes < 10 to provide a 2 digit string
const qTimeFormat = computed(() => {
  const hours = props.endTime.Hours < 10 ? '0' + props.endTime.Hours : props.endTime.Hours
  const minutes = props.endTime.Minutes < 10 ? '0' + props.endTime.Minutes : props.endTime.Minutes
  return hours + ':' + minutes
})

const qInputFormat = computed(() => {
  const justHour = qTimeFormat.value.slice(0, 2)
  // determine am/pm
  const suffix = justHour >= 12 ? ' pm' : ' am'
  const h = justHour % 12
  return (h + ':' + qTimeFormat.value.slice(3) + suffix)
})

function timeChange (time) {
  emit('timeChange', props.day, time, 'end')
}
</script>

<style lang="scss" scoped>

</style>
