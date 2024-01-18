<template>
  <div class="row q-pa-md">
    <q-toolbar class="text-center text-weight-medium">
      <q-toolbar-title class="text-h6">
        Agent Metric Data
      </q-toolbar-title>
    </q-toolbar>
    <div class="col-6">
      <agent-analytics-avg-interaction-time :agentId="agentId"/>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AgentAnalyticsAvgInteractionTime from '../components/AgentAnalyticsAvgInteractionTime.vue'

const route = useRoute()
const agentId = ref(route.params.agentId)
</script>

<style lang="scss" scoped>

</style>
