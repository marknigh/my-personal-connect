import { useUserStore } from '../stores/user'
import { Auth } from 'aws-amplify'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/profile', component: () => import('pages/ProfilePage.vue') },
      { path: '/calendarview', component: () => import('pages/CalendarViewPage.vue') },
      { path: '/hoursofoperations', component: () => import('pages/HoursOfOperationsPage.vue') },
      { path: '/queues', component: () => import('pages/QueueListPage.vue') },
      { path: '/listusers', component: () => import('pages/UserListPage.vue') },
      { path: '/metrics', component: () => import('pages/RealTimeMeticsPage.vue') },
      { path: '/routingprofiles', component: () => import('pages/RoutingProfileListPage.vue') },
      { path: '/menucounts', component: () => import('pages/MenuCountPage.vue') },
      { path: '/calendarview', component: () => import('pages/CalendarViewPage.vue') },
      { path: '/customschedules', component: () => import('pages/CustomScheduleListPage.vue') },
      { path: '/customschedule/:schedule?', name: 'schedule', component: () => import('pages/CustomSchedulePage.vue') },
      { path: '/contactflows', component: () => import('pages/ContactFlowListPage.vue') },
      { path: '/contactflowdetails/:flowid', name: 'contactflow', component: () => import('pages/ContactFlowDetailsPage.vue') },
      { path: '/contacts', component: () => import('pages/ContactsListPage.vue') },
      { path: '/contactdetails/:contactid', name: 'contactdetails', component: () => import('pages/ContactDetailsPage.vue') },
      { path: '/buckets', component: () => import('pages/GetS3BucketPage.vue') },
      { path: '/holidays', component: () => import('pages/HolidayListPage.vue') },
      { path: '/holidaydetails/:holidayId?', component: () => import('pages/HolidayDetailsPage.vue') }
    ]
  },
  { path: '/signin', name: 'signin', component: () => import('src/pages/SignInPage.vue') },
  { path: '/signup', component: () => import('pages/SignUpPage.vue') },
  { path: '/verification', name: 'verification', component: () => import('pages/VerficationCodePage.vue'), props: true },
  { path: '/forgotpassword', name: 'forgotpassword', component: () => import('pages/ForgotPasswordPage.vue'), props: true },
  {
    path: '/callback',
    name: 'callback',
    component: () => import('pages/CallbackPage.vue'),
    beforeEnter: async () => {
      const userStore = useUserStore()
      userStore.user = await Auth.currentAuthenticatedUser()
      return '/profile'
    }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
