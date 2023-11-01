<template>
  <q-page padding>
    <div class="fit row wrap justify-evenly">
      <q-toolbar>
        <q-toolbar-title shrink>
          <p class="text-h6"> Quick Connects
            <q-badge align="top" color="white">
              <q-icon name="add" size="sm" color="primary" @click="newQuickConnect" />
            </q-badge>
          </p>
        </q-toolbar-title>
      </q-toolbar>
      <div style="min-width: 400px;">
        <q-list separator>

          <q-item v-for="qc in quickConnects" :key="qc.id" clickable v-ripple @click="getQCDetails(qc)">

            <q-item-section>
              <q-item-label lines="1">{{ qc.Name }}</q-item-label>
              <q-item-label caption> Last Modified Date: {{ lastModifiedDisplay(qc.LastModifiedTime) }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-icon :name="sectionIcon(qc.Type)" :color="sectionColor(qc.Type)"/>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <q-separator spaced vertical color="black" style="height: 500px"/>
      <div class="col-6 items-center">
        <div v-if="qcDetails">
          <q-input v-model="qcDetails.Name" type="text" label="Name" label-color="primary" :rules="[value => !!value || 'Required Field']" bottom-slots />

          <q-input v-model="qcDetails.Description" type="text" label="Description" label-color="primary" :rules="[value => !!value || 'Required Field']" bottom-slots />

          <template v-if="qcDetails.QuickConnectConfig.QuickConnectType === 'PHONE_NUMBER'">
            <q-input v-model="qcDetails.QuickConnectConfig.PhoneConfig.PhoneNumber" type="text" label="Phone Number" label-color="primary" :rules="[value => !!value || 'Required Field']" bottom-slots />
          </template>
          <template v-if="qcDetails.QuickConnectConfig.QuickConnectType === 'USER'">
            <quick-connect-flow-info
              v-model:Id="qcDetails.QuickConnectConfig.UserConfig.ContactFlowId"
              label="User Transfer Flow"
              type="AGENT_TRANSFER"
            />
            <quick-connect-agent-info
              label="Agent"
              v-model:Id="qcDetails.QuickConnectConfig.UserConfig.UserId"
            />
          </template>
          <template v-if="qcDetails.QuickConnectConfig.QuickConnectType === 'QUEUE'">
            <quick-connect-flow-info
              v-model:Id="qcDetails.QuickConnectConfig.QueueConfig.ContactFlowId"
              label="Queue Transfer Flow"
              type="QUEUE_TRANSFER"
            />
            <quick-connect-queue-info
              v-model:Id="qcDetails.QuickConnectConfig.QueueConfig.QueueId"
              label="Queue"
            />
          </template>
          <div>
            <q-btn class="q-ma-sm" color="primary" label="update" @click="updateQC"/>
            <q-btn class="q-ma-sm" color="red" label="cancel" @click="cancelQC"/>
            <q-btn class="q-ma-sm" flat label="delete" @click="deleteQC"/>
          </div>
        </div>
        <div v-if="newQC">
          <quick-connect-new
            @savedQC="insertNewQC"
            @cancelQC="cancelNewQC"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { Auth } from 'aws-amplify'
import { ConnectClient, ListQuickConnectsCommand, DescribeQuickConnectCommand, DeleteQuickConnectCommand, UpdateQuickConnectNameCommand, UpdateQuickConnectConfigCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'
import QuickConnectAgentInfo from 'src/components/QuickConnectAgentInfo.vue'
import QuickConnectFlowInfo from 'src/components/QuickConnectFlowInfo.vue'
import QuickConnectNew from 'src/components/QuickConnectNew.vue'
import QuickConnectQueueInfo from 'src/components/QuickConnectQueueInfo.vue'

const $q = useQuasar()
const instanceStore = useInstanceStore()
const creds = ref({})
let quickConnects = reactive([])
const qcDetails = ref(null)
const newQC = ref(false)

function sectionIcon (type) {
  switch (type) {
    case 'USER':
      return 'person'
    case 'PHONE_NUMBER':
      return 'phone'
    case 'QUEUE':
      return 'queue'
  }
}

function sectionColor (type) {
  switch (type) {
    case 'USER':
      return 'primary'
    case 'PHONE_NUMBER':
      return 'accent'
    case 'QUEUE':
      return 'secondary'
  }
}

function lastModifiedDisplay (time) {
  return new Date(time * 1000).toLocaleString()
}

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      getQuickConnects()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function getQuickConnects () {
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

  const command = new ListQuickConnectsCommand(input)

  try {
    const response = await client.send(command)
    console.log(response)
    response.QuickConnectSummaryList.forEach((element) => {
      quickConnects.push({ Name: element.Name, Id: element.Id, Type: element.QuickConnectType, LastModifiedTime: element.LastModifiedTime })
    })
  } catch (error) {
    console.log('Error retrieving quick connects list: ', error)
  }
}

async function getQCDetails (quickConnect) {
  newQC.value = false
  qcDetails.value = null

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials: creds.value
  })

  const command = new DescribeQuickConnectCommand({
    InstanceId: instanceStore.Id,
    QuickConnectId: quickConnect.Id
  })

  try {
    const DescribeQuickConnectResponse = await client.send(command)
    qcDetails.value = DescribeQuickConnectResponse.QuickConnect
  } catch (error) {
    console.log('Error retrieving queue list: ', error)
  }
}

function newQuickConnect () {
  qcDetails.value = false
  newQC.value = true
}

function insertNewQC (quickConnect) {
  quickConnects = []
  getQuickConnects()
}

function cancelNewQC () {
  newQC.value = false
}

async function updateQC () {
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
    QuickConnectId: qcDetails.value.QuickConnectId,
    Name: qcDetails.value.Name,
    Description: qcDetails.value.Description
  }

  try {
    await client.send(new UpdateQuickConnectNameCommand(input))

    const inputConfig = {
      InstanceId: instanceStore.Id,
      QuickConnectId: qcDetails.value.QuickConnectId
    }

    switch (qcDetails.value.QuickConnectConfig.QuickConnectType) {
      case 'PHONE_NUMBER': {
        inputConfig.QuickConnectConfig = {
          QuickConnectType: 'PHONE_NUMBER',
          PhoneConfig: {
            PhoneNumber: qcDetails.value.QuickConnectConfig.PhoneConfig.PhoneNumber
          }
        }
        break
      }
      case 'QUEUE':
        console.log('reached queue switch')
        inputConfig.QuickConnectConfig = {
          QuickConnectType: 'QUEUE',
          QueueConfig: {
            QueueId: qcDetails.value.QuickConnectConfig.QueueConfig.QueueId,
            ContactFlowId: qcDetails.value.QuickConnectConfig.QueueConfig.ContactFlowId
          }
        }
        break
      case 'USER':
        inputConfig.QuickConnectConfig = {
          QuickConnectType: 'USER',
          UserConfig: {
            UserId: qcDetails.value.QuickConnectConfig.UserConfig.UserId,
            ContactFlowId: qcDetails.value.QuickConnectConfig.UserConfig.ContactFlowId
          }
        }
        break
    }
    await client.send(new UpdateQuickConnectConfigCommand(inputConfig))
    quickConnects = []
    getQuickConnects()
  } catch (error) {
    console.log('Error retrieving quick connects list: ', error)
  }
}

function cancelQC () {
  qcDetails.value = null
}

async function deleteQC () {
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
    QuickConnectId: qcDetails.value.QuickConnectId
  }

  try {
    await client.send(new DeleteQuickConnectCommand(input))
    quickConnects = []
    getQuickConnects()
    $q.notify(
      {
        type: 'positive',
        message: 'Your Quick Connect has been Deleted'
      }
    )
    qcDetails.value = null
  } catch (error) {
    console.log('Error retrieving quick connects list: ', error)
  }
}

</script>

<style lang="scss" scoped>

</style>
