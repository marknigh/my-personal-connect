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
      <div class="q-pt-md col-3">
        <q-btn color="primary" label="Save" @click="saveProfile" />
      </div>
      <div class="col-2 q-pt-md self-end">
        <q-btn flat label="delete account" @click="deleteAccount"/>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Auth } from 'aws-amplify'
import { useInstanceStore } from '../stores/instance'
import { useUserStore } from '../stores/user'

const instanceStore = useInstanceStore()
const router = useRouter()
const $q = useQuasar()

const currentUser = ref()
const instanceId = ref(instanceStore.Id)
const userStore = useUserStore()

onBeforeMount(() => {
  Auth.currentAuthenticatedUser().then((user) => {
    currentUser.value = user
  })
})

async function saveProfile () {
  instanceStore.Id = instanceId.value
  await Auth.updateUserAttributes(currentUser.value, {
    family_name: currentUser.value.attributes.family_name,
    given_name: currentUser.value.attributes.given_name
  })
  userStore.user.attributes.family_name = currentUser.value.attributes.family_name
  userStore.user.attributes.given_name = currentUser.value.attributes.given_name
}

async function deleteAccount () {
  $q.dialog({
    title: 'Delete Account',
    message: 'Type \'delete\' ',
    prompt: {
      isValid: val => val === 'delete'
    },
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const result = await Auth.deleteUser()
      console.log(result)
      router.push('/signin')
    } catch (error) {
      console.log('Error deleting user', error)
    }
  })
}
</script>

<style lang="scss" scoped>

</style>
