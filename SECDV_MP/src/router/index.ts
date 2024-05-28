import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: HomeView
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/register.vue')
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/home.vue')
    }
  ]
})

export default router
