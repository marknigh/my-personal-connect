<template>
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

const props = defineProps(['queueId'])
const creds = ref()
const barChartColors = ref(['#25476a', '#AB47BC', '#26a69a', '#e1e7f0', '#9FCC2E', '#03a9f4'])
const loading = ref(true)
const dates = ref([])
const barChartData = ref([])
const option = ref(
  {
    title: {
      text: 'Contacts Handled',
      subtext: 'Past 7 Days',
      left: 'center'
    },
    color: barChartColors.value,
    legend: {},
    tooltip: {},
    grid: {
      left: '2%',
      // right: '2%',
      // bottom: '2%',
      containLabel: true
    },
    yAxis: {
      type: 'category',
      // axisLabel: { interval: 0, rotate: 0 },
      data: dates.value
    },
    xAxis: {
      // minInterval: 1,
      type: 'value',
      interval: 1
    },
    dataset: [
      {
        source: barChartData.value
      }
    ],
    series:
      {
        type: 'bar',
        itemStyle: {
          color: (param) => {
            return barChartColors.value[param.value[1] % barChartColors.value.length]
          }
        },
        barWidth: '35%'
      }
  }
)

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      ContactsHandled()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function ContactsHandled () {
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
    EndTime: new Date(date.subtractFromDate(new Date(), { minutes: 5 })), // required
    Filters: [
      {
        FilterKey: 'QUEUE',
        FilterValues: [props.queueId]
      }
    ],
    Groupings: ['QUEUE'],
    Interval: {
      IntervalPeriod: 'DAY',
      TimeZone: 'UTC'
    },
    Metrics: [
      { Name: 'CONTACTS_HANDLED' }
    ],
    ResourceArn: 'arn:aws:connect:us-east-1:844527799542:instance/b2f6e7d8-2ce4-4ce7-b641-88761ccb7b2e', // required
    StartTime: new Date(date.subtractFromDate(new Date(), { days: 7 })) // required
  }
  const command = new GetMetricDataV2Command(input)
  const GetMetricDataV2Response = await client.send(command)
  console.log('CONTACTS_HANDLED: ', GetMetricDataV2Response)

  // Get Dimension
  GetMetricDataV2Response.MetricResults.forEach((element) => {
    dates.value.push(date.formatDate(element.MetricInterval.EndTime, 'MMM Do, YYYY'))
    const rowData = []
    rowData.push(date.formatDate(element.MetricInterval.EndTime, 'MMM Do, YYYY'), Math.round(element.Collections[0].Value))
    barChartData.value.push(rowData)
  })
  loading.value = false
  if (barChartData.value.length === 0) {
    option.value.title.subtext = 'No Data'
    option.value.xAxis.show = false
    option.value.yAxis.show = false
  }
}
</script>

<style scoped>
.chart {
  height: 50vh;
  width: 50vh;
}
</style>
