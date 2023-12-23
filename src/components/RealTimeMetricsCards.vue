<template>
  <q-card class="bg-transparent no-shadow no-border" bordered>
    <q-card-section>
      <div class="row q-col-gutter-md">
        <div v-for="(metric, index) in metrics" :key="index" class="col-4">
          <q-item :style="`background-color: ${ metric.color1 }`" class="q-pa-none">
            <q-item-section v-if="iconPosition === 'left'" side :style="`background-color: ${ metric.color2 }`" class=" q-pa-lg q-mr-none text-white">
              <q-icon :name="metric.icon" color="white" size="24px"></q-icon>
            </q-item-section>
            <q-item-section class=" q-pa-md q-ml-none  text-white">
              <q-item-label class="text-white text-h6 text-weight-bolder">{{ displayValue(metric) }}</q-item-label>
              <q-item-label>{{ metric.displayName }}</q-item-label>
            </q-item-section>
            <q-item-section v-if="iconPosition === 'right'" side class="q-mr-md text-white">
              <q-icon :name="metric.icon" color="white" size="44px"></q-icon>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  metrics: Array,
  iconPosition: String
})

function displayValue (metric) {
  let value = ''
  switch (metric.unit) {
    case 'SECONDS':
      value = Math.round((metric.value / 1000))
      break
    case 'COUNT':
      value = metric.value
      break
    case 'PERCENT':
      value = metric.value + '%'
      break
  }
  return value
}
</script>

<style lang="sass" scoped>
</style>
