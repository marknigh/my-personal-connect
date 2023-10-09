<template>
  <q-page padding>
    <div class="fit row wrap justify-evenly">
      <q-toolbar>
        <q-toolbar-title shrink>
          Prompts in Call Flow
        </q-toolbar-title>
      </q-toolbar>
      <div style="min-width: 400px;">
        <q-list separator>
          <template v-for="(action, index) in contactFlowDetail.Actions" :key="index">
            <template v-if="action.Type === 'MessageParticipant'">
              <q-item clickable @click="showTextSSML(action)">
                {{ action.Identifier }}
              </q-item>
            </template>
          </template>
        </q-list>
      </div>
      <q-separator spaced vertical color="black" style="height: 500px"/>
        <div style="max-width: 100%; min-width: 500px;">
          <template v-if="textSSML">
            <q-input
              :readonly="!editing"
              bottom-slots
              v-model="textSSML.Parameters.Text"
              type="textarea"
              autogrow
            >
              <template #after>
                <q-icon name="edit" color="primary" @click="editText"/>
                <q-icon v-if="editing" color="primary" name="save" @click="saveText"/>
              </template>
              <template #counter>
                {{ textSSML.length }}
              </template>
            </q-input>
          </template>
        </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, DescribeContactFlowCommand, UpdateContactFlowContentCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'
import { useRoute } from 'vue-router'

const route = useRoute()
const instanceStore = useInstanceStore()
const contactFlowDetail = ref({})
const creds = ref(null)
const textSSML = ref('')
const editing = ref(false)

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      getContactFlowDetails()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

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
    ContactFlowId: route.params.flowid
  }

  try {
    const DescribeContactFlowResponse = await client.send(new DescribeContactFlowCommand(input))
    console.log('DescribeContactFlowResponse: ', DescribeContactFlowResponse)
    contactFlowDetail.value = JSON.parse(DescribeContactFlowResponse.ContactFlow.Content)
    console.log('contactFlowDetail.value: ', contactFlowDetail.value)
  } catch (error) {
    console.log('Error retrieving queue list: ', error)
  }
}

function showTextSSML (action) {
  console.log('displayTextSSML: ', action)
  textSSML.value = action
}

function editText () {
  console.log('editText')
  editing.value = true
}

async function saveText () {
  console.log(textSSML.value)
  // const credentials = {
  //   accessKeyId: creds.value.accessKeyId,
  //   secretAccessKey: creds.value.secretAccessKey,
  //   sessionToken: creds.value.sessionToken
  // }

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials: creds.value
  })

  const input = {
    InstanceId: instanceStore.Id,
    ContactFlowId: route.params.flowid,
    Content: JSON.stringify(contactFlowDetail.value)
  }

  try {
    const UpdatePromptResponse = await client.send(new UpdateContactFlowContentCommand(input))
    console.log('UpdatePromptResponse: ', UpdatePromptResponse)
  } catch (error) {
    console.log('Error retrieving queue list: ', error)
  }
}

</script>

<style lang="scss" scoped>

</style>
