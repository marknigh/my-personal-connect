<template>
  <div v-if="!editing">
    <p class="no-margin text-subtitle1">
      <q-icon size="sm" name="directions_run" color="secondary"/>
      {{ routingProfileName }}
      <q-icon size="xs" name="edit" color="secondary" @click="Edit"/>
    </p>
  </div>
  <div v-if="editing">
    <q-select emit-value
      map-options
      clearable
      dense
      v-model="selectedRP"
      :options="routingProfileList"
      option-value="id"
      option-label="name"
      @clear="Cancel"
      >
        <template #after v-if="selectedRP" >
          <q-icon name="save" color="primary" @click="SaveRoutingProfile"/>
        </template>
    </q-select>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ConnectClient, DescribeRoutingProfileCommand, ListRoutingProfilesCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'

const instanceStore = useInstanceStore()
const props = defineProps(['routingProfileId', 'creds'])
const emit = defineEmits(['ChangeRoutingProfile'])
const routingProfileName = ref()
const editing = ref(false)
const routingProfileList = ref([])
const selectedRP = ref(null)

GetRoutingProfileName()

async function GetRoutingProfileName () {
  const credentials = {
    accessKeyId: props.creds.accessKeyId,
    secretAccessKey: props.creds.secretAccessKey,
    sessionToken: props.creds.sessionToken
  }

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials
  })

  const input = {
    InstanceId: instanceStore.Id,
    RoutingProfileId: props.routingProfileId
  }

  const command = new DescribeRoutingProfileCommand(input)

  try {
    const response = await client.send(command)
    routingProfileName.value = response.RoutingProfile.Name
  } catch (error) {
    console.log('Error retrieving user list: ', error)
  }
}

async function Edit () {
  editing.value = true
  const credentials = {
    accessKeyId: props.creds.accessKeyId,
    secretAccessKey: props.creds.secretAccessKey,
    sessionToken: props.creds.sessionToken
  }

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials
  })

  const input = {
    InstanceId: instanceStore.Id
  }

  const command = new ListRoutingProfilesCommand(input)

  try {
    const ListRoutingProfilesResponse = await client.send(command)
    ListRoutingProfilesResponse.RoutingProfileSummaryList.forEach((element) => {
      routingProfileList.value.push({ id: element.Id, name: element.Name })
    })
  } catch (error) {
    console.log('Error retrieving hours of operation list: ', error)
  }
}

async function SaveRoutingProfile () {
  emit('ChangeRoutingProfile', selectedRP)
  editing.value = false
}

function Cancel () {
  editing.value = false
  routingProfileList.value = []
}
</script>

<style lang="scss" scoped>

</style>
