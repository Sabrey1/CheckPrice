<template>
  <div class="flex align-items-center justify-content-center" style="min-height: 80vh">
    <div class="text-center">
      <h1 class="text-6xl m-0">404</h1>
      <p class="text-xl mt-2 mb-4">Page not found</p>
      <Button label="Back to products" icon="pi pi-home" @click="router.push('/')" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()
</script>
