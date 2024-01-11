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
import { ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  MarkPointComponent,
  MarkLineComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  ScatterChart,
  CanvasRenderer,
  MarkPointComponent,
  MarkLineComponent
])

const props = defineProps(['queueId'])
const creds = ref()
const barChartColors = ref(['#25476A', '#03A9F4', '#AB47BC', '#9FCC2E', '#df5645', '#fa9f1b', '#9FCC2E', '#03a9f4'])
const loading = ref(true)
const dates = ref([])
const barChartData = ref([])
const option = ref(
  {
    title: {
      text: 'Average Contact Duration',
      subtext: 'Past 7 Days',
      left: 'center'
    },
    color: barChartColors.value,
    legend: {},
    tooltip: {
      formatter: (param) => {
        // console.log('tooltip=>param: ', param)
        return param.data[0] + ' - ' + new Date(param.data[1] * 1000).toISOString().substring(14, 19)
      }
    },
    xAxis: {
      type: 'category',
      data: dates.value
    },
    yAxis: {
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
        type: 'scatter',
        itemStyle: {
          color: (param) => {
            return barChartColors.value[param.value[1] % barChartColors.value.length]
          }
        },
        markPoint: {
          symbol: 'pin',
          label: {
            formatter: (param) => {
              return new Date(param.data.value * 1000).toISOString().substring(14, 19)
            }
          },
          itemStyle: {
            color: '#25476A',
            borderColor: '#AB47BC'
          },
          data: [
            { type: 'max', name: 'Max' },
            { type: 'min', name: 'Min' }
          ]
        },
        markLine: {
          label: {
            formatter: (param) => {
              return new Date(param.data.value * 1000).toISOString().substring(14, 19)
            }
          },
          itemStyle: {
            color: '#9FCC2E'
          },
          data: [
            { type: 'average', name: 'AVG' }
          ]
        }
      }
  }
)

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      AvgContactDuration()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function AvgContactDuration () {
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
      { Name: 'AVG_CONTACT_DURATION' }
    ],
    ResourceArn: 'arn:aws:connect:us-east-1:844527799542:instance/b2f6e7d8-2ce4-4ce7-b641-88761ccb7b2e', // required
    StartTime: new Date(date.subtractFromDate(new Date(), { days: 7 })) // required
  }
  const command = new GetMetricDataV2Command(input)
  const GetMetricDataV2Response = await client.send(command)
  // console.log('AVG_CONTACT_DURATION: ', GetMetricDataV2Response)

  // Get Dimension
  GetMetricDataV2Response.MetricResults.forEach((element) => {
    dates.value.push(date.formatDate(element.MetricInterval.EndTime, 'MMM Do, YYYY'))
    const rowData = []
    // rowData.push(element.MetricInterval.StartTime.toDateString(), new Date(element.Collections[0].Value * 1000).toISOString().substr(11, 8))
    rowData.push(date.formatDate(element.MetricInterval.EndTime, 'MMM Do, YYYY'), Math.round(element.Collections[0].Value))
    // rowData.push(element.MetricInterval.StartTime.toDateString())
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
