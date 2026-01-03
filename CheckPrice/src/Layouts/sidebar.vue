<template>
  <div class="flex h-screen">
    <div
      v-if="showSidebar"
      class="surface-900 text-white h-full fixed top-0 left-0 sidebar flex flex-column"
      :style="{ width: visible ? '16rem' : '0', backgroundColor: '#1f2937' }"
    >
      <div class="p-3 text-xl font-bold border-bottom-1 border-700" style="color: #ffffff;">
        My App
      </div>

      <ul class="list-none p-2 m-0 flex-grow-1 overflow-auto">
         
        <li>
          <RouterLink
            to="/"
            class="flex align-items-center p-3 border-round hover:surface-700 text-white no-underline"
          >
            <i class="pi pi-box mr-3"></i>
            <span>ផលិតផល</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/category"
            class="flex align-items-center p-3 border-round hover:surface-700 text-white no-underline"
          >
            <i class="pi pi-objects-column mr-3"></i>
            <span>ឈ្មោះប្រភេទ</span>
          </RouterLink>
        </li>
      </ul>

      <!-- <div class="p-2 border-top-1 border-700">
        <RouterLink
          to="/settings"
          class="flex align-items-center p-3 border-round hover:surface-700 text-white no-underline"
        >
          <i class="pi pi-cog mr-3"></i>
          <span>Settings</span>
        </RouterLink>
        <RouterLink
          to="/login"
           @click.native="handleLogout"
          class="flex align-items-center p-3 border-round hover:surface-700 text-white no-underline"
        >
          <i class="pi pi-sign-out mr-3"></i>
          <span>Logout</span>
        </RouterLink>
      </div> -->
    </div>

    <div
      class="flex-1 min-h-screen content"
      :style="{ marginLeft: showSidebar && visible ? '16rem' : '0' }"
    >

      <div v-if="showSidebar" class="top-bar surface-0 p-2 shadow-1 flex align-items-center justify-content-between">
        <div class="flex align-items-center">
          <Button icon="pi pi-bars" class="p-button-text" @click="toggle" />
          <span class="ml-2 font-bold text-2xl">{{ pageTitle }}</span>
        </div>
         
      </div>

      <div class="p-4 pt-16 overflow-auto h-[calc(100vh-64px)]">
      <!-- <div> -->
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import Button from 'primevue/button'
 

const route = useRoute()
 

const visible = ref(false)

const showSidebar = computed(() => !route.meta.hideSidebar)

const pageTitle = computed(() => route.meta.title ? route.meta.title : '')

const toggle = () => {
  visible.value = !visible.value
}

const handleLogout = (event) => {
  // Prevent default RouterLink navigation so we can handle it manually
  event.preventDefault();

  // Clear saved credentials
  localStorage.removeItem('user_info');
  localStorage.removeItem('auth_token');
  
  // Navigate to login
  router.push('/login');
};
</script>

<style scoped>
.sidebar {
  overflow: hidden;
  transition: width 0.3s ease;
  background-color: #1f2937 !important;
}

.sidebar :deep(span) {
  color: #ffffff !important;
}

.sidebar :deep(a:hover) {
  background-color: #374151 !important;
  color: #ffffff !important;
}

.sidebar :deep(a:hover span) {
  color: #ffffff !important;
}

.content {
  transition: margin-left 0.3s ease;
}

/* Top Bar Fixed */
.top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
