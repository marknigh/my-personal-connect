<template>
    <q-input v-show="!isEditing" v-model="matchSchedule.title" borderless readonly dense>
      <template #append>
        <q-icon name="edit" size="xs" color="primary" @click="ChangeFlowSchedule"/>
      </template>
    </q-input>

    <template v-if="isEditing">
      <q-select
        v-model="matchSchedule"
        options-dense
        option-label="title"
        option-value="ScheduleId"
        dense
        :options="customScheduleList"
      >
        <template #after>
          <q-icon name="save" color="primary" @click="SaveNewSchedule"/>
          <q-icon name="cancel" color="primary" @click="CancelEditing"/>
        </template>
      </q-select>
    </template>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import axios from 'axios'
import { Auth } from 'aws-amplify'

const $q = useQuasar()
const props = defineProps({
  flowId: {
    type: String,
    required: true
  },
  flowSchedule: {
    type: Object
  },
  customScheduleList: {
    type: Array,
    required: true
  }
})
const matchSchedule = ref(null)
const originalMatchedSchedule = ref(null)
const isEditing = ref(false)

matchSchedule.value = props.customScheduleList.find((e) => e.ScheduleId === props.flowSchedule.scheduleId)
originalMatchedSchedule.value = matchSchedule.value

async function SaveNewSchedule () {
  const config = {
    url: (process.env.DEV ? process.env.DEV_URL : process.env.PROD_URL) + '/mpc/flowschedule/flow',
    'X-Amz-Date': '',
    maxBodyLength: Infinity,
    headers: {
      Authorization: `Bearer ${((await Auth.currentSession()).getIdToken().getJwtToken())}`
    },
    method: 'PUT',
    data: {
      id: props.flowSchedule.id,
      scheduleId: matchSchedule.value.ScheduleId,
      flowId: props.flowSchedule.flowId
    }
  }
  axios.request(config).then((response) => {
    console.log('response: ', response)
    $q.notify(
      {
        type: 'positive',
        message: 'The Flow\'s schedule has been updated'
      }
    )
    isEditing.value = false
  }).catch((err) => {
    console.log(err)
  })
}

function ChangeFlowSchedule () {
  isEditing.value = true
}

function CancelEditing () {
  isEditing.value = !isEditing.value
  matchSchedule.value = originalMatchedSchedule.value
}

</script>

<style lang="scss" scoped>

</style>
