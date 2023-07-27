import { boot } from 'quasar/wrappers'
import { Amplify } from 'aws-amplify'
import awsconfig from '../aws-exports'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  Amplify.configure(awsconfig)
})
