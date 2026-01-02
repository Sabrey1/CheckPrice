// src/router.js

import { createRouter, createWebHistory } from 'vue-router'
import CategoryList from '@/Category/CategoryList.vue'
import Products from '@/Product/ProductList.vue'
// Define routes
const routes = [
//   {
//     path: '/',
//     name: 'Home',
//     component: Home
//   },
  {
    path: '/category',
    name: 'CategoryList',
    component: CategoryList,
    meta: { title: 'ឈ្មោះប្រភេទ' }
  },
  {
    path: '/product',
    name: 'Products',
    component: Products,
    meta: { title: 'Product List' }
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
