import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase'
import LandingView from '@/views/LandingView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import { onAuthStateChanged } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory('/final-project-l1_group_23/'),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: LandingView,
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterView,
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
    },
    {
      path: '/community',
      name: 'Community',
      component: () => import('../views/CommunityView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/map',
      name: 'Map',
      component: () => import('../views/MapView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/canteen/:id',
      name: 'CanteenDetail',
      component: () => import('../views/CanteenView.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/recommended',
      name: 'Recommended',
      component: () => import('../views/RecommendedView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/favourites',
      name: 'Favourites',
      component: () => import('../views/FavouritesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/rewards',
      name: 'Rewards',
      component: () => import('../views/RewardsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

function getCurrentUser() {
  return new Promise((resolve) => {
    if (auth.currentUser !== null) {
      resolve(auth.currentUser)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

router.beforeEach(async (to, from) => {
  if (!to.meta.requiresAuth) return true
  const user = await getCurrentUser()
  if (user) return true
  return { path: '/', query: { authError: 'You must be logged in to access this page.' } }
})

export default router
