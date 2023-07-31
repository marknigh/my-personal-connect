<template>
  <q-page v-if="currentUser" padding>
    <div class="row">
      <div class="col-4">
        <q-input readonly v-model="currentUser.attributes.email" type="text" label="username" />
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        <q-input readonly v-model="currentUser.attributes.name" type="text" label="Name" />
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        <q-input v-model="instanceId" type="text" label="Instance ID" />
      </div>
    </div>
    <div class="row">
      <div class="q-pt-md">
        <q-btn color="primary" icon="check" label="OK" @click="Save()" />
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

function Save () {
  instanceStore.Id = instanceId.value
}
</script>

<style lang="scss" scoped>

</style>
