# My Personal Amazon Connect

A Quasar project for AWS Connect front-end webapge with AWS Amplify, Cognito, Quasar, Vue3 and Vite.

This application written with the help of Quasar (Qusasar.dev) allows a user to view RealTime Metrics, change the Hours of Operation schedule and view users and queues of their Amazon Connect Instance.

In this initial version, the instance ID is stored locally via the profile page and will need to be re-entered if logged out. Future version will allow persistent store of the Instance ID.

Recently added and is customized for my instance only is the retrieving of the menu selection (1 or 2) of MenuOne of my demo instance. This was to demostrate Amazon Connect's ability to store user input in a DynamoDB and have this front-end appliation retrieve this data and display in tabular format.

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).