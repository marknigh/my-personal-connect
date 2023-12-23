<template>
  <div class="col-6">
    <q-card class="bg-transparent no-shadow no-border" bordered>
      <q-card-section>
        <v-chart
          :option="option"
          :resizable="true"
          autoresize
          style="height: 350px; width: auto"
          :loading="loading"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { date } from 'quasar'
import { Auth } from 'aws-amplify'
import { ConnectClient, GetMetricDataV2Command } from '@aws-sdk/client-connect'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  BarChart,
  CanvasRenderer
])

const creds = ref()
const barChartData = ref([])
const barChartColors = ref(['#25476A', '#03A9F4', '#AB47BC', '#9FCC2E', '#df5645', '#fa9f1b', '#9FCC2E', '#03a9f4'])
const loading = ref(true)
const dates = ref([])
const option = ref(
  {
    title: {
      text: 'Total Abandon',
      left: 'center'
    },
    color: barChartColors.value,
    legend: {},
    tooltip: {},
    xAxis: {
      type: 'category',
      axisLabel: { interval: 0, rotate: 30 },
      data: dates.value
    },
    yAxis: {
      minInterval: 1,
      type: 'value'
    },
    dataset: [
      {
        source: barChartData.value
      }
    ],
    series:
      {
        type: 'bar',
        // data: barChartData.value,
        borderColor: '#000',
        itemStyle: {
          color: (param) => {
            return barChartColors.value[param.value[1] % barChartColors.value.length]
          }
        }
      }
  }
)

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      Abandonment()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

// function displayDates () {
//   lastThreeDaysArray.value.forEach((element) => {
//     displayDatesArray.value.push(element.toDateString())
//   })
// }

// function getLastThreeDays () {
//   lastThreeDaysArray.value.push(today.value)
//   for (let i = 1; i < 5; i++) {
//     lastThreeDaysArray.value.push(date.subtractFromDate(new Date(), { date: i }))
//   }
//   displayDates()
// }

async function Abandonment () {
  // getLastThreeDays()
  const credentials = {
    accessKeyId: creds.value.accessKeyId,
    secretAccessKey: creds.value.secretAccessKey,
    sessionToken: creds.value.sessionToken
  }

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials
  })

  const input = { // GetMetricDataV2Request
    EndTime: new Date(date.subtractFromDate(new Date(), { minute: 5 })), // required
    Filters: [
      {
        FilterKey: 'QUEUE',
        FilterValues: ['0bff74d2-26c5-4e4f-b435-2c76f58a4f79', '5e0fa714-4f2c-432a-a4b6-1b42d44c6603', '65daffb8-6d9b-459d-8b5c-2e9b8f89f039']
      }
    ],
    Groupings: ['QUEUE'],
    Interval: {
      IntervalPeriod: 'DAY',
      TimeZone: 'UTC'
    },
    Metrics: [
      { Name: 'CONTACTS_ABANDONED' }
    ],
    ResourceArn: 'arn:aws:connect:us-east-1:844527799542:instance/b2f6e7d8-2ce4-4ce7-b641-88761ccb7b2e', // required
    StartTime: new Date(date.subtractFromDate(new Date(), { days: 7 })) // required
  }
  const command = new GetMetricDataV2Command(input)
  const GetMetricDataV2Response = await client.send(command)
  console.log('CONTACTS_CREATED: ', GetMetricDataV2Response)

  // Get Dimension
  GetMetricDataV2Response.MetricResults.forEach((element) => {
    dates.value.push(element.MetricInterval.StartTime.toDateString())
    const rowData = []
    rowData.push(element.MetricInterval.StartTime.toDateString(), element.Collections[0].Value)
    barChartData.value.push(rowData)
  })
  loading.value = false
}

</script>

<style scoped>

</style>
