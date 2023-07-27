import { ConnectClient, ListQueuesCommand } from '@aws-sdk/client-connect'

async function getQueues (instanceId, credentials) {
  const input = { // ListQueuesRequest
    InstanceId: instanceId,
    QueueTypes: ['STANDARD']
  }

  const creds = {
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    sessionToken: credentials.sessionToken
  }

  const client = new ConnectClient({
    region: 'us-east-1',
    credentials: creds
  })

  const queues = []

  const command = new ListQueuesCommand(input)

  try {
    const response = await client.send(command)
    response.QueueSummaryList.forEach((queue) => {
      queues.push(queue)
    })
    return queues
  } catch (error) {
    console.log('Error retrieving queue list: ', error)
    return error
  }
}

export default getQueues
