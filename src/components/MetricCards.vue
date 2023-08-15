<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <q-card
      class="my-card text-white"
    >
      <q-card-section>
        <div class="text-h6">{{ props.name }}</div>
        <div class="text-h2 text-center">{{ displayValue }}</div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['name', 'value', 'unit'])

const displayValue = computed(() => {
  let value = ''
  switch (props.unit) {
    case 'SECONDS':
      value = Math.round((props.value / 1000))
      break
    case 'COUNT':
      value = props.value
      break
    case 'PERCENT':
      value = props.value + '%'
      break
  }
  return value
})
</script>

<style lang="sass" scoped>
.my-card
  background-color: $secondary
</style>
