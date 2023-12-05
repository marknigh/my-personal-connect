<template>
  <q-page padding>
    <div class="row">
      <div class="col-3">
        <p class="text-h6">Agent Status Dashboard</p>
      </div>
      <div class="col-9" v-show="UserHierarchyGroups">
        <div class="row">

          <template v-for="(hs, index) in hierarchyStructure" :key="hs.Id">
            <agent-state-hierarchy :hierarchyStructure="hierarchyStructure" :UserHierarchyGroups="UserHierarchyGroups" :index="index" :levelIds="levelIds" @valueChange="valueChange"/>
          </template>
          <div class="q-pa-xs"><q-btn color="primary" label="filter" flat @click="GetCurrentUserData"/></div>
        </div>
      </div>
    </div>
      <q-page padding>
        <q-list>
          <q-item v-for="agent in agentStatus" :key="agent.id">
            <q-item-section> {{ fullName(agent.firstName, agent.lastName) }}</q-item-section>
            <agent-state-status :status="agent.currentState" :creds="creds" :instanceId="instanceStore.Id"/>
            <agent-state-duration :status="agent.currentState" :timeStamp="agent.currentStartTimestamp" />
          </q-item>
        </q-list>
      </q-page>
  </q-page>
</template>

<script setup>
import { Auth, API } from 'aws-amplify'
import { ConnectClient, GetCurrentUserDataCommand, DescribeUserHierarchyStructureCommand, ListUserHierarchyGroupsCommand, DescribeUserHierarchyGroupCommand, DescribeUserCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'
import AgentStateHierarchy from '../components/AgentStateHierarchy.vue'
import AgentStateStatus from '../components/AgentStateStatus.vue'
import AgentStateDuration from '../components/AgentStateDuration.vue'
import { onMounted, ref, onUnmounted, reactive } from 'vue'
import * as subscriptions from '../graphql/subscriptions'

const instanceStore = useInstanceStore()

const creds = ref()
const hierarchyStructure = ref()
let sub
const agentStatus = ref([])
const UserHierarchyGroups = ref([])
const levelIds = reactive({})
// const userDataList = ref([])

onMounted(async () => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      GetHierarchyStructure()
      GetHierarchyGroups()
      sub = API.graphql({ query: subscriptions.onAgentState }).subscribe({
        next: ({ provider, value }) => {
          console.log('next: ', value)
          const index = agentStatus.value.findIndex((element) => element.agentARN === value.data.onAgentState.agentARN)
          if (index >= 0) {
            agentStatus.value.splice(index, 1, value.data.onAgentState)
            agentStatus.value[index].currentState = value.data.onAgentState.currentState
            agentStatus.value[index].currentStartTimestamp = value.data.onAgentState.currentStartTimestamp
          } else {
            agentStatus.value.push(value.data.onAgentState)
          }
        },
        error: (error) => console.warn(error)
      })
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

onUnmounted(() => {
  sub.unsubscribe()
})

function valueChange (value) {
  const key = Object.keys(value)[0]
  switch (key) {
    case ('LevelOne'):
      delete levelIds.LevelTwo
      delete levelIds.LevelThree
      delete levelIds.LevelFour
      break
    case ('LevelTwo'):
      delete levelIds.LevelThree
      delete levelIds.LevelFour
      break
    default:
      break
  }
  levelIds[key] = { id: value[key].Id, name: value[key].Name }
}

function fullName (fName, lName) {
  return fName + ' ' + lName
}

async function GetHierarchyStructure () {
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

  const command = new DescribeUserHierarchyStructureCommand(input)

  try {
    const DescribeUserHierarchyStructureResponse = await client.send(command)
    console.log('DescribeUserHierarchyStructureResponse: ', DescribeUserHierarchyStructureResponse)
    hierarchyStructure.value = DescribeUserHierarchyStructureResponse.HierarchyStructure
  } catch (error) {
    console.log('Error retrieving hours of Describe User Hierarchy Structure Response: ', error)
  }
}

async function GetHierarchyGroups () {
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

  const command = new ListUserHierarchyGroupsCommand(input)
  try {
    const DescribeUserHierarchyStructureResponse = await client.send(command)
    DescribeUserHierarchyStructureResponse.UserHierarchyGroupSummaryList.forEach(async (element) => {
      try {
        const input = {
          InstanceId: instanceStore.Id,
          HierarchyGroupId: element.Id
        }
        const command = new DescribeUserHierarchyGroupCommand(input)
        const DescribeUserHierarchyGroupResponse = await client.send(command)
        UserHierarchyGroups.value.push(DescribeUserHierarchyGroupResponse.HierarchyGroup)
      } catch (error) {
        console.log('Error retrieving DescribeUserHierarchyGroupResponse: ', error)
      }
    })
  } catch (error) {
    console.log('Error retrieving hours of operation list: ', error)
  }
}

async function GetCurrentUserData () {
  // clear current data
  agentStatus.value = []
  // What Level of User to Get Current Data
  const level = Object.keys(levelIds).length
  let searchLevel = ''
  switch (level) {
    case 1:
      searchLevel = levelIds.LevelOne.id
      break
    case 2:
      searchLevel = levelIds.LevelTwo.id
      break
    case 3:
      searchLevel = levelIds.LevelThree.id
      break
    case 4:
      searchLevel = levelIds.LevelFour.id
      break
    case 5:
      searchLevel = levelIds.LevelFive.id
      break
  }
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
    Filters: {
      UserHierarchyGroups: [searchLevel]
    }
  }

  const command = new GetCurrentUserDataCommand(input)
  try {
    const GetCurrentUserDataResponse = await client.send(command)
    GetCurrentUserDataResponse.UserDataList.forEach(async (element) => {
      const input = {
        InstanceId: instanceStore.Id,
        UserId: element.User.Id
      }
      const command = new DescribeUserCommand(input)
      try {
        const DescribeUserResponse = await client.send(command)
        const agentObject = {
          agentARN: element.User.Arn,
          currentState: element.Status.StatusName,
          currentStartTimestamp: element.Status.StatusStartTimestamp,
          firstName: DescribeUserResponse.User.IdentityInfo.FirstName,
          lastName: DescribeUserResponse.User.IdentityInfo.LastName
        }
        const index = agentStatus.value.findIndex((e) => e.agentARN === element.User.Arn)
        if (index >= 0) {
          agentStatus.value.splice(index, 1, agentObject)
        } else {
          agentStatus.value.push(agentObject)
        }
      } catch (error) {
        console.log('Error retrieving DescribeUserResponse: ', error)
      }
    })
  } catch (error) {
    console.log('Error retrieving GetCurrentUserDataResponse: ', error)
  }
}

// async function searchUsers () {
//   GetCurrentUserData()
//   const credentials = {
//     accessKeyId: creds.value.accessKeyId,
//     secretAccessKey: creds.value.secretAccessKey,
//     sessionToken: creds.value.sessionToken
//   }

//   const client = new ConnectClient({
//     region: 'us-east-1',
//     credentials
//   })

//   const input = {
//     InstanceId: instanceStore.Id,
//     SearchCriteria: {
//       HierarchyGroupCondition: {
//         value: levelIds.LevelFour.id,
//         HierarchyGroupMatchType: 'EXACT'
//       }
//     }
//   }

//   const command = new SearchUsersCommand(input)

//   try {
//     const SearchUsersResponse = await client.send(command)
//     console.log('SearchUsersResponse: ', SearchUsersResponse)
//     SearchUsersResponse.Users.forEach((element) => {
//       agentStatus.value.push({
//         agentARN: element.Arn,
//         firstName: element.IdentityInfo.FirstName,
//         lastName: element.IdentityInfo.LastName,
//         currentState: 'unknown',
//         currentStartTimestamp: new Date()

//       })
//     })
//   } catch (error) {
//     console.log('Error retrieving hours of Describe User Hierarchy Structure Response: ', error)
//   }
// }

</script>

<style lang="scss" scoped>

</style>
