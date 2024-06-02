import { createRouter, createWebHistory } from 'vue-router';
import HomeLayout from '../HomeLayout.vue'; 
// import Admin from '../views/Admin.vue'; // Adjust the path as necessary


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/register.vue')
    },
    {
      path: '/home',
      component: HomeLayout, // Use HomeLayout.vue as the layout
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/home.vue')
        }
      ]
    },
    {
      path: '/admin',
      component: HomeLayout, // Use HomeLayout.vue as the layout
      children: [
        {
          path: '',
          name: 'admin',
          component: () => import('../views/admin.vue')
        }
      ]
    }
  ]
});

export default router;
