import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase'
import LandingView from '@/views/LandingView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'

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
  const user = auth.currentUser
  if (requiresAuth && !user) {
    next('/')
  } else {
    next()
  }
})

export default router
