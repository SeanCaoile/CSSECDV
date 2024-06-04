import { createRouter, createWebHistory } from 'vue-router';
import HomeLayout from '../HomeLayout.vue'; 
import Cookies from 'js-cookie';
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
          component: () => import('../views/home.vue'),
          meta: { requiresAuth: true }
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
          component: () => import('../views/admin.vue'),
          meta: { requiresAuth: true }
        }
      ]
    }
  ]
});

// Global navigation guard
router.beforeEach((to, from, next) => {
  // Check if the route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Check if user is authenticated (replace isAuthenticated with your authentication logic)
    if (!isAuthenticated()) {
      // If not authenticated, redirect to login page
      next({ name: 'login' });
    } else {
      // If authenticated, allow navigation
      next();
    }
  } else {
    // For routes that do not require authentication, allow navigation
    next();
  }
});

// Example method to check if user is authenticated
function isAuthenticated() {
  // Check if session or token exists
  return Cookies.get('sessionId') !== undefined;
}

export default router;
