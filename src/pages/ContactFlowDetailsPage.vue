<template>
  <q-page padding>
    <div class="fit row wrap justify-evenly">
      <q-toolbar>
        <q-toolbar-title shrink>
          Prompts in  {{ contactFlowName }}
        </q-toolbar-title>
        <q-space />
        <q-btn flat round color="accent" size="md" icon="arrow_back" :to="{ path: '/contactflows'}"/>
      </q-toolbar>
      <div style="height: 650px; max-width: 500px; min-width: 400px;">
        <q-list separator padding>
            <template v-for="(action, key, index) in contactActionGroup" :key="index">
              <template v-if="key === 'MessageParticipant'">
                <q-item-label>Play</q-item-label>
                <template v-for="(mp, index) in action" :key="index">
                  <display-prompt-content :action="mp" :contactFlowDetail="contactFlowDetail" @edit="showParameters"/>
                </template>
              </template>
              <template v-if="key === 'GetParticipantInput'">
                <q-item-label>Get Customer Input</q-item-label>
                <template v-for="(gp, index) in action" :key="index">
                  <display-prompt-content :action="gp" :contactFlowDetail="contactFlowDetail" @edit="showParameters"/>
                </template>
              </template>
              <template v-if="key === 'MessageParticipantIteratively'">
                <q-item-label>Loop Prompts</q-item-label>
                <template v-for="(mp, index) in action" :key="index">
                    <display-prompt-content :action="mp" @edit="showParameters" :contactFlowDetail="contactFlowDetail"/>
                </template>
              </template>
            </template>
        </q-list>
      </div>
      <q-separator spaced vertical color="black" style="height: 500px"/>
        <div style="max-width: 100%; min-width: 500px;">
          <template v-if="textSSML">
              <q-input
                :readonly="!editingTextSSML"
                bottom-slots
                v-model="textSSML"
                type="textarea"
                autogrow
              >
                <template #after>
                  <template v-if="!editingTextSSML">
                    <q-icon name="edit" color="primary" @click="editPromptText"/>
                  </template>
                  <template v-else>
                    <q-icon color="primary" name="save" @click="savePrompt"/>
                    <q-icon color="primary" name="cancel" @click="cancelEdit"/>
                  </template>
                </template>
                <template #counter>
                  Character Count: {{ textSSML.length }} - {{ 'Text' in currentAction.Parameters ? 'Text' : 'SSML' }}
                </template>
              </q-input>
          </template>
        </div>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, DescribeContactFlowCommand, UpdateContactFlowContentCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'
import { useRoute } from 'vue-router'
import DisplayPromptContent from '../components/DisplayPromptContent.vue'

const $q = useQuasar()
const route = useRoute()
const instanceStore = useInstanceStore()
const contactFlowDetail = ref({})
const creds = ref(null)
const originalTextSSML = ref('')
const textSSML = ref('')
const type = ref(null)
const editingTextSSML = ref(false)
const currentAction = ref(null)
const contactActionGroup = ref({})
const contactFlowName = ref(null)

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
    contactFlowDetail.value = JSON.parse(DescribeContactFlowResponse.ContactFlow.Content)
    contactFlowName.value = DescribeContactFlowResponse.ContactFlow.Name
    contactActionGroup.value = groupBy(contactFlowDetail.value.Actions, 'Type')
  } catch (error) {
    console.log('Error retrieving queue list: ', error)
  }
}

function groupBy (arr, property) {
  return arr.reduce((action, x) => {
    if (!action[x[property]]) { action[x[property]] = [] }
    action[x[property]].push(x)
    return action
  }, {})
}

function showParameters (action) {
  console.log('displayTextSSML: ', action)
  currentAction.value = action
  type.value = action.Type
  textSSML.value = action.Parameters.Text ? action.Parameters.Text : action.Parameters.SSML
}

function editPromptText (identifier) {
  originalTextSSML.value = textSSML.value
  editingTextSSML.value = true
}

function cancelEdit () {
  textSSML.value = originalTextSSML.value
  editingTextSSML.value = false
}

async function savePrompt () {
  const findIndex = contactFlowDetail.value.Actions.findIndex((element) => {
    return element.Identifier === currentAction.value.Identifier
  })

  contactFlowDetail.value.Actions[findIndex].Parameters.Text = textSSML.value

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials: creds.value
  })

  try {
    await client.send(new UpdateContactFlowContentCommand(
      {
        InstanceId: instanceStore.Id,
        ContactFlowId: route.params.flowid,
        Content: JSON.stringify(contactFlowDetail.value)
      }
    ))
    $q.notify(
      {
        type: 'positive',
        message: 'The text has been updated'
      }
    )
  } catch (error) {
    console.log('Error updating prompt: ', error)
  } finally {
    editingTextSSML.value = false
  }
}

</script>

<style lang="scss" scoped>

</style>
