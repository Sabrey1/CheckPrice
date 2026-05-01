<template>
  <div>
    <Button  />
      <Dialog
    v-model:visible="visible"
    modal
    header="ព័ត៌មានផលិតផល"
    :style="{ width: '30rem', margin: '1rem' }"
  >
    <!-- Avatar -->
    <div class="flex justify-content-center mb-4">
      <Avatar
        v-if="product?.image"
        :image="product.image"
        size="xlarge"
        shape="circle"
        style="width: 80px; height: 80px;"
      />
      <Avatar
        v-else
        :label="firstLetter"
        size="xlarge"
        shape="circle"
        style="width: 80px; height: 80px; font-size: 2rem; background-color: #6366f1; color: #fff;"
      />
    </div>

    <table class="category-table">
      <tbody>
        <tr>
          <th>ឈ្មោះ</th>
          <td>{{ product?.product_name }}</td>
        </tr>
        <tr>
          <th>តម្លៃ</th>
          <td>{{ product?.price || '-' }}</td>
        </tr>
        <tr v-if="product?.description">
          <th>ពិពណ៌នា</th>
          <td>{{ product?.description || '-' }}</td>
        </tr>
        <tr>
          <th>ថ្ងៃបង្កើត</th>
          <td>{{ formatDate(product?.created_at) }}</td>
        </tr>
      </tbody>
    </table>
  </Dialog>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'

const props = defineProps({
  product: Object,
  visible: Boolean
})

const emit = defineEmits(['update:visible'])

const visible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

// Get first letter of product name, fallback to '?'
const firstLetter = computed(() => {
  return props.product?.product_name?.charAt(0).toUpperCase() || '?'
})

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : '-'
}
</script>

<style scoped>
.category-table {
  width: 100%;
  border-collapse: collapse;
}

.category-table th {
  text-align: left;
  padding: 8px;
  width: 40%;
  font-weight: 600;
}

.category-table td {
  padding: 8px;
}
</style>