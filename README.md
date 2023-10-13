# My Personal Amazon Connect

A Quasar project for AWS Connect front-end webapge with AWS Amplify, Cognito, Quasar, Vue3 and Vite.

This application written with the help of Quasar (Qusasar.dev) allows a user to view RealTime Metrics, change the Hours of Operation schedule per queue, view contact events along with listening to the recording and view users and queues of their Amazon Connect Instance.

In this initial version, the instance ID is stored locally via the profile page and will need to be re-entered if logged out. Future version will allow persistent store of the Instance ID.

Recently added and is customized for my instance only is the retrieving of the menu selection (1 or 2) of MenuOne of my demo instance. This was to demostrate Amazon Connect's ability to store user input in a DynamoDB and have this front-end appliation retrieve this data and display in tabular format.

Please reach out to me at marknigh70@gmail.com


ROADMAP:
* Call Flows, give the ability for the user to change prompts text or SSML only. release 0.2.0
* Call Flows, filter on Call Flow Name 0.2.0
* Custom Schedule. Add Holidays.
* Contacts -> click row and get additional details.
* Contacts -> add Customer Phone Number in list.
* fix bug with only active call flows are getting returned. Routing->Call Flows.
* Add the ability to create/modify Quick Connects.
* Start some capabilities around Contact Lens.
* Change the playing of the recording to streaming especially large recordings.
* Add Campaign functionality.
