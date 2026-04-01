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
      component: LandingView,
    },
    {
      path: '/register',
      component: RegisterView,
    },
    {
      path: '/login',
      component: LoginView,
    },
    {
      path: '/community',             // ← restored as its own separate route object
      name: 'Community',
      component: () => import('../views/CommunityView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/canteen/:id',           // ← separate route object
      name: 'CanteenDetail',
      component: () => import('../views/CanteenView.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

// Helper: resolves once Firebase auth state is known
function getCurrentUser() {
  return new Promise((resolve) => {
    // If already initialized, return immediately
    if (auth.currentUser !== null) {
      resolve(auth.currentUser)
      return
    }
    // Otherwise wait for Firebase to finish initializing
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user) // resolves with user OR null
    })
  })
}

router.beforeEach(async (to, from, next) => {
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  const user = await getCurrentUser() // always wait for Firebase

  if (user) {
    next()
  } else {
    next({ path: '/', query: { authError: 'You must be logged in to access this page.' } })
  }
})

export default router
