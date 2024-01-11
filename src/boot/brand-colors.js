import { boot } from 'quasar/wrappers'
import { setCssVar } from 'quasar'
// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
// custom colors is based on the following admin dashboard. https://themeon.net/nifty/v3.0.1/
export default boot((/* { app, router, ... } */) => {
  setCssVar('primary', '#25476A')
  setCssVar('secondary', '#26a69a')
  setCssVar('accent', '#AB47BC')
  setCssVar('tertiary', '#e1e7f0')
  setCssVar('negative', '#df5645')
  setCssVar('warning', '#fa9f1b')
  setCssVar('positive', '#9FCC2E')
  setCssVar('info', '#03a9f4')
})
