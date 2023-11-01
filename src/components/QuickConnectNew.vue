<template>
  <q-form
    ref="newQCFormRef"
    @submit="saveQuickConnect"
    greedy
  >
    <q-input v-model="quickConnect.name" type="text" label="Name" label-color="primary" stack-label :rules="[value => !!value || 'Required Field']" bottom-slots />
    <q-input v-model="quickConnect.description" type="text" label="Description" label-color="primary" stack-label :rules="[value => !!value || 'Required Field']" bottom-slots />
    <q-select v-model="quickConnect.type" :options="options" label="Type" label-color="primary" stack-label bottom-slots />

    <q-input v-if="quickConnect.type === 'Phone'" v-model="phoneNumber" type="tel" label="Phone Number" mask="+1 (XXX) XXX-XXXX" unmasked-value label-color="primary" stack-label />

    <div v-if="quickConnect.type === 'User'">
      <quick-connect-flow-info
        label="User Transfer Flow"
        type="AGENT_TRANSFER"
        v-model:Id="quickConnect.contactFlowId"
      />
      <quick-connect-agent-info
        label="Search Users"
        v-model:Id="quickConnect.userId"
      />
    </div>

    <div v-if="quickConnect.type === 'Queue'">
      <quick-connect-flow-info
        label="Queue Transfer Flow"
        type="QUEUE_TRANSFER"
        v-model:Id="quickConnect.contactFlowId"
      />
      <quick-connect-queue-info
        label="Search Queue"
        v-model:Id="quickConnect.queueId"      />
    </div>

    <div>
      <q-btn class="q-m1-sm" label="Submit" type="submit" color="primary" />
      <q-btn class="q-ma-sm" color="red" label="cancel" @click="cancelQuickConnect" />
    </div>
  </q-form>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { ConnectClient, CreateQuickConnectCommand } from '@aws-sdk/client-connect'
import { Auth } from 'aws-amplify'
import { useInstanceStore } from '../stores/instance'
import QuickConnectFlowInfo from 'src/components/QuickConnectFlowInfo.vue'
import QuickConnectQueueInfo from 'src/components/QuickConnectQueueInfo.vue'
import QuickConnectAgentInfo from './QuickConnectAgentInfo.vue'

const $q = useQuasar()
const instanceStore = useInstanceStore()

const emit = defineEmits(['savedQC', 'cancelQC'])

const options = ref(['Phone', 'User', 'Queue'])
const quickConnect = ref(
  {
    name: '',
    description: '',
    type: '',
    contactFlowId: '',
    userId: '',
    queueId: ''
  }
)
const phoneNumber = ref()
const newQCFormRef = ref()

function cancelQuickConnect () {
  emit('cancelQC')
}

async function saveQuickConnect () {
  const client = new ConnectClient({
    region: 'us-east-1',
    credentials: await Auth.currentCredentials()
  })

  const input = {
    InstanceId: instanceStore.Id,
    Name: quickConnect.value.name,
    Description: quickConnect.value.description
  }

  switch (quickConnect.value.type) {
    case 'Phone': {
      // make phone number in e.164 format
      const e164 = '+1' + phoneNumber.value

      input.QuickConnectConfig = {
        QuickConnectType: 'PHONE_NUMBER',
        PhoneConfig: {
          PhoneNumber: e164
        }
      }
      break
    }
    case 'Queue':
      console.log('reached queue switch')
      input.QuickConnectConfig = {
        QuickConnectType: 'QUEUE',
        QueueConfig: {
          QueueId: quickConnect.value.queueId,
          ContactFlowId: quickConnect.value.contactFlowId
        }
      }
      break
    case 'User':
      input.QuickConnectConfig = {
        QuickConnectType: 'USER',
        UserConfig: {
          UserId: quickConnect.value.userId,
          ContactFlowId: quickConnect.value.contactFlowId
        }
      }
      break
  }

  const command = new CreateQuickConnectCommand(input)

  try {
    const response = await client.send(command)
    input.id = response.QuickConnectId
    emit('savedQC')
    $q.notify('Quick Connect has been successfully Saved')
  } catch (error) {
    console.log('Error creating quick connect: ', error)
  }
}
</script>

<style lang="scss" scoped>

</style>
