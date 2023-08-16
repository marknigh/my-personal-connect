<template>
  <q-page padding>
    <div class="fit row wrap justify-evenly items-center content-center">
      <q-list separator>
        <q-item-label header>Routing Profiles</q-item-label>
        <q-item clickable v-ripple @click="GetRPDetails(rp)" v-for="rp in routingProfiles" :key="rp.Id">
          <!-- <q-item-section avatar top>
            <q-avatar icon="folder" :color="queue.QueueType = 'primary' ? 'primary' : 'accent'" text-color="white" />
          </q-item-section> -->

          <q-item-section>
            <q-item-label lines="1">{{ rp.name }}</q-item-label>
            <!-- <q-item-label caption>{{ user.QueueType }}</q-item-label> -->
          </q-item-section>

          <q-item-section side>
            <q-icon name="info" color="green" />
          </q-item-section>
        </q-item>
      </q-list>
      <q-separator spaced vertical color="black" style="height: 500px"/>
      <div class="col-5 row">
        <q-list v-if="routingProfileDetails">
          <q-item>
            <q-item-section>
              <q-item-label>
                {{ routingProfileDetails.Name }}
              </q-item-label>
              <q-item-label caption> {{ routingProfileDetails.Description }}</q-item-label>
              <q-item-label> <span class="text-bold">Associated Queues:</span> {{ routingProfileDetails.NumberOfAssociatedQueues }}</q-item-label>
              <q-item-label> <span class="text-bold">Associated Agents:</span> {{ routingProfileDetails.NumberOfAssociatedUsers }}</q-item-label>
              <template v-for="media in routingProfileDetails.MediaConcurrencies" :key="media.id">
                <q-item-label>
                  {{ media.Channel }} Max. Contacts Per Agent: {{ media.Concurrency }}
                </q-item-label>
              </template>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Auth } from 'aws-amplify'
import { ConnectClient, ListRoutingProfilesCommand, DescribeRoutingProfileCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from '../stores/instance'

const instanceStore = useInstanceStore()

const creds = ref()
const routingProfiles = ref([])
const routingProfileDetails = ref(null)

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      // console.log('currentCredentials: ', credentials)
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

  const command = new ListRoutingProfilesCommand(input)

  try {
    const ListRoutingProfilesResponse = await client.send(command)
    ListRoutingProfilesResponse.RoutingProfileSummaryList.forEach((element) => {
      routingProfiles.value.push({ id: element.Id, name: element.Name })
    })
  } catch (error) {
    console.log('Error retrieving hours of operation list: ', error)
  }
}

async function GetRPDetails (routingProfile) {
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

  const command = new DescribeRoutingProfileCommand(input)

  try {
    const DescribeRoutingProfileResponse = await client.send(command)
    routingProfileDetails.value = DescribeRoutingProfileResponse.RoutingProfile
  } catch (error) {
    console.log('Error retrieving user list: ', error)
  }
}
</script>

<style lang="scss" scoped>

</style>
