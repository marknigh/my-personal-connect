<template>
  <template v-if="!loading">
      <q-table
        flat
        :rows="rows"
        :columns="columns"
        @row-click="getHolidayDetails"
      >
        <template #top>
          <q-toolbar>
            <q-toolbar-title>
              <p class="text-h6"> Holiday Schedules
                <q-badge align="top" color="white">
                  <q-icon name="add" size="xs" color="primary" @click="newHoliday"></q-icon>
                </q-badge>
              </p>
            </q-toolbar-title>
          </q-toolbar>
        </template>
      </q-table>
  </template>
  <template v-else>
    <q-page class="flex flex-center">
      <q-circular-progress
        indeterminate
        size="75px"
        :thickness="0.6"
        color="primary"
        center-color="secondary"
        class="q-ma-md"
      />
    </q-page>
  </template>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Auth } from 'aws-amplify'
import { useRouter } from 'vue-router'

const loading = ref(true)
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
  }
])
const router = useRouter()

onMounted(async () => {
  const config = {
    url: (process.env.DEV ? process.env.DEV_URL : process.env.PROD_URL) + '/mpc/holidays/schedules',
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
  }).finally()
})

function newHoliday () {
  router.push('/holidaydetails/')
}

function getHolidayDetails (evt, row, index) {
  router.push({ path: `holidaydetails/${row.HolidayId}` })
}

</script>

<style lang="scss" scoped>

</style>
