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
  </q-page>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue'
import { Auth } from 'aws-amplify'

const currentUser = ref()

onBeforeMount(() => {
  Auth.currentAuthenticatedUser().then((user) => {
    currentUser.value = user
  })
})
</script>

<style lang="scss" scoped>

</style>
