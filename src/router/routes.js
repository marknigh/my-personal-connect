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
      { path: '/menucounts', component: () => import('pages/MenuCountPage.vue') }
    ]
  },
  { path: '/signin', component: () => import('src/pages/SignInPage.vue') },
  { path: '/signup', component: () => import('pages/SignUpPage.vue') },
  { path: '/verification', name: 'verification', component: () => import('pages/VerficationCodePage.vue'), props: true },
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
