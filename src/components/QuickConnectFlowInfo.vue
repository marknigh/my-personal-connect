<template>
  <q-select
    emit-value
    map-options
    bottom-slots
    label-color="primary"
    v-model="name"
    :label="label"
    stack-label=""
    :options="contactFlowsList"
    option-label="Name"
    option-value="Id"
    @filter="filterFunc"
    @filter-abort="abortFilterFn"
    @update:model-value="$emit('update:Id', name)"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, DescribeContactFlowCommand, ListContactFlowsCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'

const instanceStore = useInstanceStore()

const props = defineProps(['Id', 'type', 'label'])
defineEmits(['update:Id'])
const creds = ref()
const contactFlowName = ref(null)
const name = ref(contactFlowName)
const contactFlowsList = ref([])

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      if (props.Id) { getContactFlowDetails() }
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

function abortFilterFn () {
  console.log('abortFilterFn')
}

async function filterFunc (val, update, abort) {
  // This function is used to lazy load the selects
  const list = await getAllContactFlows()
  update(() => {
    contactFlowsList.value = list.filter((element) => element.ContactFlowType === props.type)
  })
}

async function getContactFlowDetails () {
  const credentials = {
    accessKeyId: creds.value.accessKeyId,
    secretAccessKey: creds.value.secretAccessKey,
    sessionToken: creds.value.sessionToken
  }

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials
  })

  const input = {
    InstanceId: instanceStore.Id,
    ContactFlowId: props.Id
  }

  try {
    const DescribeContactFlowResponse = await client.send(new DescribeContactFlowCommand(input))
    contactFlowName.value = DescribeContactFlowResponse.ContactFlow.Name
  } catch (error) {
    console.log('Error retrieving queue list: ', error)
  }
}

async function getAllContactFlows () {
  const client = new ConnectClient({
    region: 'us-east-1',
    credentials: creds.value
  })

  const input = {
    InstanceId: instanceStore.Id
  }

  try {
    const ListContactFlowsResponse = await client.send(new ListContactFlowsCommand(input))
    return ListContactFlowsResponse.ContactFlowSummaryList
  } catch (error) {
    console.log('Error retrieving contact flow list: ', error)
  }
}
</script>

<style lang="scss" scoped>

</style>
