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
const barChartColors = ref(['#25476a', '#26a69a', '#AB47BC', '#e1e7f0', '#fa9f1b', '#03a9f4'])
const loading = ref(true)
const dates = ref([])
const barChartData = ref([])
const option = ref(
  {
    title: {
      text: 'Average Abandoned Time',
      subtext: 'Past 7 Days',
      left: 'center'
    },
    color: barChartColors.value,
    legend: {},
    tooltip: {
      formatter: (params) => {
        // console.log('formatter: ', params)
        return new Date(params.data[1] * 1000).toISOString().substring(14, 19)
      }
    },
    xAxis: {
      // type: 'value',
      axisLabel: { interval: 0, rotate: 0 },
      data: dates.value
    },
    yAxis: {
      // minInterval: 1,
      type: 'value',
      axisLabel: {
        formatter: (value) => {
          return new Date(value * 1000).toISOString().substring(14, 19)
        }
      }

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
            const index = param.value[1] % barChartColors.value.length
            const color = barChartColors.value[param.value[1] % barChartColors.value.length]
            console.log('color: ', index)
            return color
          }
        },
        barWidth: '45%'
      }
  }
)

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      AvgAbandonTime()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function AvgAbandonTime () {
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
      { Name: 'AVG_ABANDON_TIME' }
    ],
    ResourceArn: 'arn:aws:connect:us-east-1:844527799542:instance/b2f6e7d8-2ce4-4ce7-b641-88761ccb7b2e', // required
    StartTime: new Date(date.subtractFromDate(new Date(), { days: 7 })) // required
  }
  const command = new GetMetricDataV2Command(input)
  const GetMetricDataV2Response = await client.send(command)
  // console.log('AVG_ABANDON_TIME: ', GetMetricDataV2Response)

  // Get Dimension
  GetMetricDataV2Response.MetricResults.forEach((element) => {
    dates.value.push(element.MetricInterval.StartTime.toDateString())
    const rowData = []
    rowData.push(element.MetricInterval.StartTime.toDateString(), Math.round(element.Collections[0].Value))
    barChartData.value.push(rowData)
  })
  loading.value = false
}
</script>

<style scoped>
.chart {
  height: 50vh;
  width: 50vh;
}
</style>
