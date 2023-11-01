<template>
  <q-page padding>
    <div class="fit row wrap justify-evenly">
      <q-toolbar>
        <q-toolbar-title>
          Routing Profiles
        </q-toolbar-title>
      </q-toolbar>
      <div style="min-width: 400px;">
        <q-list separator>
          <q-item v-for="(routingProfile, index) in routingProfiles" :key="index" clickable v-ripple @click="GetRPDetails(routingProfile)">

            <q-item-section>
              <q-item-label lines="1">{{ routingProfile.name }}</q-item-label>
              <!-- <q-item-label caption>{{ user.QueueType }}</q-item-label> -->
            </q-item-section>

            <q-item-section side>
              <q-icon name="info" color="green" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <q-separator spaced vertical color="black" style="height: 500px"/>
      <div class="col-5 row items-center">
        <div v-if="routingProfileDetails">
          <p class="no-margin text-h5 text-bold">
            {{ routingProfileDetails.Name }}
          </p>
          <p class="no-margin text-body2">
            {{ routingProfileDetails.Description }}
          </p>
          <p class="no-margin text-body1">
            <span class="text-bold">Associated Queues:</span>
            {{ routingProfileDetails.NumberOfAssociatedQueues }}
            <q-icon name="expand_more" @click="ViewAssociateQueues"/>
              <routing-profile-associated-queues v-if="viewQueues" :creds="creds" :routingProfileId="routingProfileDetails.RoutingProfileId"/>
          </p>
          <p class="no-margin text-body1">
            <span class="text-bold">Associated Agents:</span>
            {{ routingProfileDetails.NumberOfAssociatedUsers }}
          </p>

          <template v-for="media in routingProfileDetails.MediaConcurrencies" :key="media.id">
            <q-item-label>
              {{ media.Channel }} Max. Contacts Per Agent: {{ media.Concurrency }}
            </q-item-label>
          </template>

        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, ListRoutingProfilesCommand, DescribeRoutingProfileCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'
import RoutingProfileAssociatedQueues from '../components/RoutingProfileAssociatedQueues.vue'

const instanceStore = useInstanceStore()

const creds = ref()
const routingProfiles = ref([])
const routingProfileDetails = ref(null)
const viewQueues = ref(false)

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      GetRoutingProfilesList()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function GetRoutingProfilesList () {
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

  try {
    const ListRoutingProfilesResponse = await client.send(new ListRoutingProfilesCommand(input))
    ListRoutingProfilesResponse.RoutingProfileSummaryList.forEach((element) => {
      routingProfiles.value.push({ id: element.Id, name: element.Name })
    })
  } catch (error) {
    console.log('Error retrieving routing profile list: ', error)
  }
}

async function GetRPDetails (routingProfile) {
  routingProfileDetails.value = null
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
    RoutingProfileId: routingProfile.id
  }

  try {
    const DescribeRoutingProfileResponse = await client.send(new DescribeRoutingProfileCommand(input))
    routingProfileDetails.value = DescribeRoutingProfileResponse.RoutingProfile
    console.log(routingProfileDetails.value)
  } catch (error) {
    console.log('Error retrieving user list: ', error)
  }
}

function ViewAssociateQueues () {
  viewQueues.value = !viewQueues.value
}
</script>

<style lang="scss" scoped>

</style>
