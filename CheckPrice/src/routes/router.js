// src/router.js

import { createRouter, createWebHistory } from 'vue-router'
import CategoryList from '@/Category/CategoryList.vue'
import Products from '@/Product/ProductList.vue'
import RoleList from '@/Role/RoleList.vue'
import UserList from '@/User/UserList.vue'
import BranchList from '@/Branch/BranchList.vue'
import Login from '@/Auth/Login.vue'
// Define routes
const routes = [
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
  {
    path: '/role',
    name: 'RoleList',
    component: RoleList,
    meta: { title: 'តួនាទី' }
  },
  {
    path: '/user',
    name: 'UserList',
    component: UserList,
    meta: { title: 'អ្នកប្រើប្រាស់' }
  },
  {
    path: '/branch',
    name: 'BranchList',
    component: BranchList,
    meta: { title: 'សាខា' }
  },
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
