<template>
  <q-select
    emit-value
    map-options
    stack-label
    bottom-slots
    label-color="primary"
    v-model="name"
    :label="label"
    :options="userList"
    option-label="name"
    option-value="id"
    @filter="filterFunc"
    @filter-abort="abortFilterFn"
    @update:model-value="$emit('update:Id', name)"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, DescribeUserCommand, ListUsersCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'

const instanceStore = useInstanceStore()

const props = defineProps(['Id', 'label'])
defineEmits(['update:Id'])
const creds = ref()
const userInfo = ref(null)
const name = ref(userInfo)
const userList = ref([])

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      if (props.Id) { GetAgentInfo() }
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function GetAgentInfo () {
  userInfo.value = {}
  const client = new ConnectClient({
    region: 'us-east-1',
    credentials: creds.value
  })

  const input = {
    InstanceId: instanceStore.Id,
    UserId: props.Id
  }

  try {
    const DescribeUserResponse = await client.send(new DescribeUserCommand(input))
    userInfo.value = DescribeUserResponse.User.IdentityInfo.LastName
  } catch (error) {
    console.log('Error retrieving queue list: ', error)
  }
}

function abortFilterFn () {
  console.log('abortFilterFn')
}

async function filterFunc (val, update, abort) {
// This function is used to lazy load the selects
  const list = await getAllUsers(creds.value)
  update(() => {
    userList.value = list.filter((element) => element.name !== '')
  })
}

async function getAllUsers () {
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
    InstanceId: instanceStore.Id
  }

  const command = new ListUsersCommand(input)

  try {
    const response = await client.send(command)
    const userListArray = []
    response.UserSummaryList.forEach((element) => {
      userListArray.push({ name: element.Username, id: element.Id })
    })
    return userListArray
  } catch (error) {
    console.log('Error retrieving hours of operation list: ', error)
  }
}
</script>

<style lang="scss" scoped>

</style>
