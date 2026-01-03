// src/router.js

import { createRouter, createWebHistory } from 'vue-router'
import CategoryList from '@/Category/CategoryList.vue'
import Products from '@/Product/ProductList.vue'
import Login from '@/Auth/Login.vue'
// Define routes
const routes = [
//   {
//     path: '/',
//     name: 'Home',
//     component: Home
//   },
{
    path: '/',
    name: 'Products',
    component: Products,
    meta: { title: 'បញ្ជីផលិតផល' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login 
   
  },
  {
    path: '/category',
    name: 'CategoryList',
    component: CategoryList,
    meta: { title: 'ឈ្មោះប្រភេទ' }
  },
  
  // Catch all unmatched routes
//   {
//     path: '/:pathMatch(.*)*',
//     name: 'NotFound',
//     component: NotFound
//   }
]

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
