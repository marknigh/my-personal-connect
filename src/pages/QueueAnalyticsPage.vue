<template>
  <div class="row q-pa-md">
    <q-toolbar class="text-center text-weight-medium">
      <q-toolbar-title>
        Queue Metric Data
      </q-toolbar-title>
    </q-toolbar>
    <div class="col-6">
      <queue-analytics-contacts-queued :queueId="queueId"/>
    </div>
    <div class="col-6">
      <queue-analytics-contacts-handled :queueId="queueId"/>
    </div>
    <div class="col-6">
      <queue-analytics-avg-contact-duration :queueId="queueId"/>
    </div>
    <div class="col-6">
      <queue-analytics-avg-abandon-time :queueId="queueId"/>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import QueueAnalyticsAvgAbandonTime from '../components/QueueAnalyticsAvgAbandonTime.vue'
import QueueAnalyticsContactsQueued from 'src/components/QueueAnalyticsContactsQueued.vue'
import QueueAnalyticsAvgContactDuration from 'src/components/QueueAnalyticsAvgContactDuration.vue'
import QueueAnalyticsContactsHandled from 'src/components/QueueAnalyticsContactsHandled.vue'
const route = useRoute()

const queueId = ref(route.params.queueId)

</script>

<style lang="scss" scoped>

</style>
