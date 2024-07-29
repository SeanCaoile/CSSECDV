import { createRouter, createWebHistory } from 'vue-router';
import store from '../security/store'; // Import the Vuex store

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
      name: 'home',
      component: () => import('../views/home.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      component: () => import('../views/admin.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: "/createBlog",
      component: () => import("../views/createBlog.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: '/blogs/:blogID', 
      name: 'blogDetail',
      component: () => import('../views/blogDetail.vue'),
      props: true, 
      meta: { requiresAuth: true }
    },
    {
      path: '/blogs/:blogID/edit', // Example for dynamic blogId parameter
      name: 'editBlog',
      component: () => import('../views/editBlog.vue'),
      props: true, 
      meta: { requiresAuth: true }
    },
    {
      path: '/blogs/:blogID/delete',
      name: 'deleteBlog',
      component: () => import('../views/deleteBlog.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
  ]
});

// Global navigation guard
router.beforeEach((to, from, next) => {
  // Check if the route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Check if user is authenticated
    if (!store.getters.isAuthenticated) {
      fetch('http://localhost:3001/api/users/removeCookie', {
        method: 'POST',
        credentials: 'include',
      });
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

export default router;
