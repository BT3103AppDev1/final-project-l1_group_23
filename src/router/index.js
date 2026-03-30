import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase'
import LandingView from '@/views/LandingView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import { onAuthStateChanged } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory('/final-project-l1_group_23/'),
  routes: [
    { path: '/', component: LandingView },
    { path: '/register', component: RegisterView },
    { path: '/login', component: LoginView },
    {
      path: '/community',
      component: () => import('../views/CommunityView.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/:pathMatch(.*)*', component: () => import('../views/NotFoundView.vue') },
  ],
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  if (!requiresAuth) {
    next()
    return
  }

  const user = auth.currentUser
  if (user) {
    next()
    return
  }

  // If currentUser is null, wait for Firebase to finish initializing
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    unsubscribe()
    if (firebaseUser) {
      next()
    } else {
      next({ path: '/', query: { authError: 'You must be logged in to access this page.' } })
    }
  })
})

export default router
