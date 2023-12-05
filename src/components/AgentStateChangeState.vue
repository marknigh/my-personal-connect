<template>
    <div class="col-1">
      <q-btn-dropdown size="sm" label="change" color="primary">
        <q-list>
          <q-item v-for="state in agentStates" :key="state.Id" clickable v-close-popup @click="changeStatus(state)">
            <q-item-section>
              <q-item-label>{{ state.Name }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
</template>

<script setup>
import { Auth } from 'aws-amplify'
import { ConnectClient, PutUserStatusCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'

const instanceStore = useInstanceStore()

const props = defineProps({
  agentStates: Array,
  agent: Object
})

async function changeStatus (state) {
  Auth.currentCredentials().then(async (userCredentials) => {
    const credentials = {
      accessKeyId: userCredentials.accessKeyId,
      secretAccessKey: userCredentials.secretAccessKey,
      sessionToken: userCredentials.sessionToken
    }

    const client = new ConnectClient({
      region: 'us-east-1',
      credentials
    })

    const input = { // PutUserStatusRequest
      UserId: props.agent.agentARN, // required
      InstanceId: instanceStore.Id, // required
      AgentStatusId: state.Id // required
    }

    const command = new PutUserStatusCommand(input)

    try {
      const response = await client.send(command)
      console.log('response: ', response)
    } catch (error) {
      console.log('Error setting User Status: ', error)
    }
  })
}

</script>

<style lang="scss" scoped>

</style>
