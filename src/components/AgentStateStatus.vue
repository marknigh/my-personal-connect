<template>
  <q-item-section>
    <q-item-label>
      <q-badge rounded :color="getColor()" :label="currentState" />
    </q-item-label>
  </q-item-section>
</template>

<script setup>
const props = defineProps(['currentState', 'agentStates'])

function getColor () {
  const statusElement = props.agentStates.find((e) => e.Name === props.currentState)
  console.log('statusElement: ', statusElement.Type)
  return statusElement.Type === 'ROUTABLE' ? 'green' : 'red'
}

</script>
<style lang="scss" scoped>

</style>
