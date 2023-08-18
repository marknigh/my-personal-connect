import { boot } from 'quasar/wrappers'
import { Amplify, Auth, Hub } from 'aws-amplify'
import awsconfig from '../aws-exports'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  Amplify.configure(awsconfig)

  Hub.listen('auth', ({ payload: { event, data } }) => {
    switch (event) {
      case 'signIn':
        console.info('signIn from Hub Listen')
        getUser().then((userData) => {
          userStore.user = userData
        })
        break
      case 'cognitoHostedUI':
        getUser().then((userData) => {
          userStore.user = userData
        })
        break
      case 'signOut':
        console.log('signOut from Hub Listen')
        break
      case 'signIn_failure':
      case 'cognitoHostedUI_failure':
        console.log('Sign in failure', data)
        break
    }
  })

  function getUser () {
    return Auth.currentAuthenticatedUser().then(userData => userData)
  }
})
