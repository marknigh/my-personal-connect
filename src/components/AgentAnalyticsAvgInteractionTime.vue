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
import { ref, reactive, onMounted } from 'vue'
import { agentData } from '../assets/AgentData'
import getQueueName from '../assets/GetQueueName'
import { date } from 'quasar'
import { Auth } from 'aws-amplify'
// import { ConnectClient, GetMetricDataV2Command } from '@aws-sdk/client-connect'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  ToolboxComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  BarChart,
  CanvasRenderer,
  ToolboxComponent
])

const creds = ref()
// const props = defineProps(['agentId'])
const barChartColors = ref(['#25476A', '#03A9F4', '#AB47BC', '#9FCC2E', '#df5645', '#fa9f1b', '#9FCC2E', '#03a9f4'])
const loading = ref(true)
const barChartData = reactive([])
const dates = ref([])
const option = ref(
  {
    title: {
      id: 'agentContactsHandled',
      text: 'Contact Handled',
      subtext: 'Past 5 Days',
      left: 'center'
    },
    color: barChartColors.value,
    tooltip: {
    },
    legend: {
      bottom: '1'
    },
    toolbox: {
      show: true,
      feature: {
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ['line', 'bar'] },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    xAxis: {
      type: 'category',
      // show: false,
      axisTick: {
        alignWithLabel: true
      },
      data: dates.value
    },
    yAxis: {
      type: 'value'
    },
    series: barChartData
  }
)

onMounted(() => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
      MakeChartDate()
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

async function MakeChartDate () {
  // create a series array
  for (const queue in agentData.MetricResults) {
    const queueName = await getQueueName(creds.value, agentData.MetricResults[queue].Dimensions.QUEUE)
    const foundSeries = barChartData.findIndex((el) => {
      return el.name === queueName
    })
    if (foundSeries === -1) {
      const seriesElement = {
        name: queueName,
        type: 'bar',
        barGap: 0,
        data: []
      }
      barChartData.push(seriesElement)
    }
  }

  // get the last x days. Default is 7 but based on .
  for (let x = 0; x < 5; x++) {
    const createDate = new Date(date.subtractFromDate(new Date(), { days: x })).toDateString()
    dates.value.push(createDate)

    // start with 0 for this date.
    for (const s in barChartData) {
      barChartData[s].data.push(0)
    }

    for (const agent in agentData.MetricResults) {
      const queueName = await getQueueName(creds.value, agentData.MetricResults[agent].Dimensions.QUEUE)
      // console.log('agent: ', agentData.MetricResults[agent])
      const foundSeries = barChartData.findIndex((el) => {
        return el.name === queueName
      })
      if (agentData.MetricResults[agent].MetricInterval.EndTime.toDateString() === createDate) {
        barChartData[foundSeries].data[x] = agentData.MetricResults[agent].Collections[0].Value
      }
    }
  }
  loading.value = false
}

// async function AvgInteractionTime () {
//   // getLastThreeDays()
//   const credentials = {
//     accessKeyId: creds.value.accessKeyId,
//     secretAccessKey: creds.value.secretAccessKey,
//     sessionToken: creds.value.sessionToken
//   }

//   const client = new ConnectClient({
//     region: 'us-east-1',
//     credentials
//   })

//   const input = { // GetMetricDataV2Request
//     EndTime: new Date(date.subtractFromDate(new Date(), { minute: 1 })), // required
//     Filters: [
//       {
//         FilterKey: 'AGENT',
//         FilterValues: [props.agentId]
//       }
//     ],
//     Groupings: ['QUEUE'],
//     Interval: {
//       IntervalPeriod: 'DAY',
//       TimeZone: 'UTC'
//     },
//     Metrics: [
//       { Name: 'CONTACTS_HANDLED' }
//     ],
//     ResourceArn: 'arn:aws:connect:us-east-1:844527799542:instance/b2f6e7d8-2ce4-4ce7-b641-88761ccb7b2e', // required
//     StartTime: new Date(date.subtractFromDate(new Date(), { days: 21 })) // required
//   }
//   const command = new GetMetricDataV2Command(input)
//   const GetMetricDataV2Response = await client.send(command)
//   console.log('SUM_INTERACTION_TIME: ', GetMetricDataV2Response)

//   // Get Dimension

//   GetMetricDataV2Response.MetricResults.forEach((element) => {
//     dimensions.value.push(element.Dimensions.QUEUE)
//     dates.value.push(element.MetricInterval.StartTime.toDateString())
//     const rowData = []
//     rowData.push(element.MetricInterval.StartTime.toDateString(), element.Collections[0].Value)
//     barChartData.value.push(rowData)
//   })
//   loading.value = false
// }
</script>

<style scoped>

</style>
