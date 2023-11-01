<template>
    <q-select
      emit-value
      map-options
      label-color="primary"
      v-model="name"
      :label="label"
      stack-label
      bottom-slots
      :options="queues"
      option-label="Name"
      option-value="Id"
      @filter="filterFunc"
      @filter-abort="abortFilterFn"
      @update:model-value="$emit('updateQueueInfo', name)"
    />
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, DescribeQueueCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'
import getQueues from 'src/assets/GetQueues'

const instanceStore = useInstanceStore()

const props = defineProps(['Id', 'label'])
defineEmits(['updateQueueInfo'])
let creds = reactive({})
const queueInfo = ref(null)
const name = ref(queueInfo)
const queues = ref([])

onMounted(async () => {
  try {
    creds = await Auth.currentCredentials()
    if (props.Id) { GetQueueInfo() }
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function GetQueueInfo () {
  queueInfo.value = {}

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials: creds
  })

  try {
    const DescribeQueueResponse = await client.send(new DescribeQueueCommand({
      InstanceId: instanceStore.Id,
      QueueId: props.Id
    }))
    queueInfo.value = DescribeQueueResponse.Queue
  } catch (error) {
    console.log('Error retrieving queue list: ', error)
  }
}

function abortFilterFn () {
  console.log('abortFilterFn')
}

async function filterFunc (val, update, abort) {
  // This function is used to lazy load the selects
  const queueList = await getQueues(creds)
  update(async () => {
    queues.value = queueList.filter((element) => element.Status !== 'DISABLED')
  })
}

</script>

<style lang="scss" scoped>

</style>
