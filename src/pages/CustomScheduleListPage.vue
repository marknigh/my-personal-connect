<template>
  <q-page padding>

    <q-table
      flat bordered
      dense
      :rows="rows"
      :columns="columns"
      :loading="loading"
      row-key="name"
    >
      <template #top>
        <q-toolbar>
          <q-toolbar-title>
            Custom Schedule <q-icon size="xs" name="add" color="secondary" @click="NewSchedule"></q-icon>
          </q-toolbar-title>
        </q-toolbar>
      </template>

      <template #body="props">
        <q-tr :props="props" @click="EditSchedule(props)">
          <q-td key="title" :props="props">
            {{ props.row.title }}
          </q-td>
          <q-td key="description" :props="props">
            {{ props.row.description }}
          </q-td>
          <q-td key="timezone" :props="props">
            {{ props.row.timezone }}
          </q-td>
        </q-tr>
      </template>
    </q-table>

  </q-page>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import axios from 'axios'
import { Auth } from 'aws-amplify'
import { useRouter } from 'vue-router'

const loading = ref(false)
const rows = ref([])
const columns = ref([
  {
    name: 'title',
    label: 'Title',
    field: 'title',
    align: 'left'
  },
  {
    name: 'description',
    label: 'Description',
    field: 'description',
    align: 'left'
  },
  {
    name: 'timezone',
    label: 'TimeZone',
    field: 'timezone',
    align: 'left'
  }
])
const router = useRouter()

onBeforeMount(async () => {
  loading.value = true
  const config = {
    url: (process.env.DEV ? process.env.DEV_URL : process.env.PROD_URL) + '/mpc/schedule/items',
    'X-Amz-Date': '',
    maxBodyLength: Infinity,
    headers: {
      Authorization: `Bearer ${((await Auth.currentSession()).getIdToken().getJwtToken())}`
    }
  }
  axios.request(config).then((response) => {
    console.log('response: ', response)
    response.data.Items.forEach((item) => {
      rows.value.push(item)
    })
    loading.value = false
  }).catch((err) => {
    console.log(err)
    loading.value = false
  })
})

function NewSchedule () {
  router.push('/customschedule')
}
function EditSchedule (row) {
  router.push({ name: 'schedule', params: { schedule: row.row.ScheduleId } })
}
</script>

<style lang="scss" scoped>

</style>
