import { ConnectClient, DescribeQueueCommand } from '@aws-sdk/client-connect'
import { useInstanceStore } from 'src/stores/instance'

async function getQueueName (credentials, queueId) {
  const instanceStore = useInstanceStore()

  const input = { // ListQueuesRequest
    InstanceId: instanceStore.Id,
    QueueId: queueId
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

  const command = new DescribeQueueCommand(input)

  try {
    const DescribeQueueResponse = await client.send(command)
    // console.log('DescribeQueueResponse: ', DescribeQueueResponse)
    return DescribeQueueResponse.Queue.Name
  } catch (error) {
    console.log('Error retrieving queue list: ', error)
    return error
  }
}

export default getQueueName
