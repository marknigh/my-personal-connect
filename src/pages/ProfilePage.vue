<template>
  <q-page v-if="currentUser" padding>
    <div class="row">
      <div class="col-4">
        <q-input readonly v-model="currentUser.attributes.email" type="text" label="username" />
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        <q-input v-model="currentUser.attributes.given_name" type="text" label="First Name" />
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        <q-input v-model="currentUser.attributes.family_name" type="text" label="Last Name" />
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        <q-input v-model="instanceId" type="text" label="Instance ID" />
      </div>
    </div>
    <div class="row">
      <div class="q-pt-md">
        <q-btn color="primary" label="Save" @click="Save()" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue'
import { Auth } from 'aws-amplify'
import { useInstanceStore } from '../stores/instance'

const instanceStore = useInstanceStore()

const currentUser = ref()
const instanceId = ref(instanceStore.Id)

onBeforeMount(() => {
  Auth.currentAuthenticatedUser().then((user) => {
    currentUser.value = user
  })
})

async function Save () {
  instanceStore.Id = instanceId.value
  await Auth.updateUserAttributes(currentUser.value, {
    family_name: currentUser.value.attributes.family_name,
    given_name: currentUser.value.attributes.given_name
  })
}
</script>

<style lang="scss" scoped>

</style>
