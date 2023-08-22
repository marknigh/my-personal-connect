import { boot } from 'quasar/wrappers'
import Plugin from '@quasar/quasar-ui-qcalendar'
import '@quasar/quasar-ui-qcalendar/dist/index.css'
export default boot(({ app }) => {
  app.use(Plugin)
})
