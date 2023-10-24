import { boot } from 'quasar/wrappers'
import { Amplify, Auth, Hub } from 'aws-amplify'
import awsConfig from '../aws-exports'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

// creating a signin redirect for localhost development and production
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
)

const [
  localRedirectSignIn,
  productionRedirectSignIn
] = awsConfig.oauth.redirectSignIn.split(',')

const [
  localRedirectSignOut,
  productionRedirectSignOut
] = awsConfig.oauth.redirectSignOut.split(',')

const updatedAwsConfig = {
  ...awsConfig,
  oauth: {
    ...awsConfig.oauth,
    redirectSignIn: isLocalhost ? localRedirectSignIn : productionRedirectSignIn,
    redirectSignOut: isLocalhost ? localRedirectSignOut : productionRedirectSignOut
  }
}

Amplify.configure(updatedAwsConfig)

export default boot(async ({ router }) => {
  Hub.listen('auth', ({ payload: { event, data } }) => {
    switch (event) {
      case 'signIn':
        console.info('signIn from Hub Listen')
        getUser().then((userData) => {
          userStore.user = userData
          router.push({ path: '/metrics' })
        }).catch(() => {
          console.log('not signed in')
          router.push({ path: '/signin' })
        })
        break
      case 'cognitoHostedUI':
        getUser().then((userData) => {
          userStore.user = userData
        })
        break
      case 'signOut':
        console.log('signOut from Hub Listen')
        userStore.user = null
        router.push({ path: '/signin' })
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
