<template>
  <q-item-section>
    <q-item-label>
      <q-badge rounded :style="{ 'background-color': color}" :label="currentState" text-color="blue-grey-10"/>
    </q-item-label>
  </q-item-section>
</template>

<script setup>
import { computed } from 'vue'
import { useProfileStore } from '../stores/profile'
const props = defineProps(['currentState', 'agentStates'])

const profileStore = useProfileStore()

const color = computed(() => {
  const color = profileStore.agentStatusColors.find((element) => element.name === props.currentState)
  return color.color
})

</script>
<style lang="scss" scoped>

</style>
