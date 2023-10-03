<template>
  <div class="q-pa-md">
    <q-table
      flat
      title="Menu Selection (+1 619-821-6184)"
      :rows="rows"
      :columns="columns"
      row-key="CallFlowId"
      :loading="loading"
      hide-no-data
      :rows-per-page-options=[15,30,45]
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <template v-slot:top-right>
        {{totalMenuCount()}}
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
    field: row => (formatDateTime(row.Date.S)),
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
    headers: {
      Authorization: `Bearer ${((await Auth.currentSession()).getIdToken().getJwtToken())}`
    }
  }
  axios.request(config).then((response) => {
    console.log('response: ', response)
    response.data.body.Items.forEach((item) => {
      rows.value.push(item)
    })
  }).catch((err) => {
    console.log(err)
  }).finally(() => {
    loading.value = false
  })
})

function totalMenuCount () {
  const menuOne = rows.value.filter(x => x.MenuOne.S === '1').length
  const menuTwo = rows.value.filter(x => x.MenuOne.S === '2').length
  return `(#1) ${menuOne} (#2) ${menuTwo}`
}

function formatDateTime (dateTime) {
  return date.formatDate(dateTime, 'MM-DD-YYYY hh:mm:ss a')
}

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
