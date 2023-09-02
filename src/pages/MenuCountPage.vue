<template>
  <div class="q-pa-md">
    <q-table
      flat
      bordered
      title="Menu Selection"
      :rows="rows"
      :columns="columns"
      row-key="name"
      :loading="loading"
      hide-no-data
    >
    <template v-slot:loading>
      <q-inner-loading showing color="primary" />
    </template>
    </q-table>
  </div>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue'
import axios from 'axios'
import { date } from 'quasar'
import { Auth } from 'aws-amplify'

const loading = ref(false)
const rows = ref([])
const columns = ref([
  // {
  //   name: 'CallFlowId',
  //   label: 'ID',
  //   field: row => row.CallFlowId.S,
  //   align: 'left'
  // },
  {
    name: 'Caller',
    label: 'Caller',
    field: row => formatTelephoneNumber(row.Caller.S),
    align: 'left'
  },
  {
    name: 'date',
    label: 'Date',
    field: row => (date.formatDate(row.Date.S, 'MM-DD-YYYY HH:MM')),
    align: 'center'
  },
  {
    name: 'MenuOne',
    label: 'Menu One',
    field: row => row.MenuOne.S
  }
])

onBeforeMount(async () => {
  // console.log((await Auth.currentSession()).getIdToken().getJwtToken())
  loading.value = true
  const config = {
    url: (process.env.DEV ? process.env.DEV_URL : process.env.PROD_URL) + '/mpc/items',
    'X-Amz-Date': '',
    maxBodyLength: Infinity,
    headers: {
      Authorization: `Bearer ${((await Auth.currentSession()).getIdToken().getJwtToken())}`
    }
  }
  axios.request(config).then((response) => {
    console.log('response: ', response)
    response.data.body.Items.forEach((item) => {
      rows.value.push(item)
    })
    loading.value = false
  }).catch((err) => {
    console.log(err)
    loading.value = false
  })
})

// function formattedDate (epoch) {
//   return date.formatDate(epoch, 'MM-DD-YYYY HH:SS')
// }

function formatTelephoneNumber (phoneNumberString) {
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '')
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    const intlCode = (match[1] ? '+1 ' : '')
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('')
  }
  return null
}
</script>

<style lang="scss" scoped>

</style>
