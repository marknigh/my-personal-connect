<template>
  <div class="q-pa-md">
    <div class="q-gutter-sm row">
      <q-input filled v-model="formattedTime" mask="time">
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time v-model="formattedTime" mask="hh:mm" @update:model-value="timeChange">
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
import { onMounted, ref } from 'vue'

const props = defineProps(['startTime', 'day'])
const emit = defineEmits(['timeChange'])
const formattedTime = ref('')

onMounted(() => {
  formatTime()
})

function formatTime () {
  const hours = props.startTime.Hours < 10 ? '0' + props.startTime.Hours : props.startTime.Hours
  const minutes = props.startTime.Minutes < 10 ? '0' + props.startTime.Minutes : props.startTime.Minutes
  formattedTime.value = hours + minutes
}

function timeChange (time) {
  emit('timeChange', props.day, time, 'start')
}
</script>

<style lang="scss" scoped>

</style>
