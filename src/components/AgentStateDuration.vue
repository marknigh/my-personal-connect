<template>
  <q-item-section>
    <template v-if="props.status !== 'Offline'">
      {{ displayTimer(timer) }}
    </template>
  </q-item-section>
</template>

<script setup>
import { date } from 'quasar'
import { ref, onUnmounted, onMounted } from 'vue'
const props = defineProps(['timeStamp', 'status'])
const timer = ref()

onMounted(() => {
  setInterval(() => {
    displayTimer(timer.value = date.getDateDiff(new Date(), props.timeStamp, 'second'))
  }, 1000)
})

function displayTimer () {
  const hours = Math.floor(timer.value / 3600)
  const minutes = Math.floor((timer.value % 3600) / 60)
  const remainingSeconds = timer.value % 60
  if (hours > 0) {
    return `${hours} hours : ${minutes} minutes: ${timer.value}`
  } else if (minutes > 1) {
    return `${minutes}:${remainingSeconds}`
  } else {
    return `${remainingSeconds} seconds`
  }
}

onUnmounted(() => {
  clearInterval()
})

</script>

<style lang="scss" scoped>

</style>
