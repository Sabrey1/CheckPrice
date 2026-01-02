<template>
  <div>
    <Button
      label="បង្ហាញ"
      icon="pi pi-eye"
      class="p-button-success"
      @click="visible = true"
    />

    <Dialog
      v-model:visible="visible"
      modal
      header="ព័ត៌មានប្រភេទ"
      :style="{ width: '30rem' }"
    >
      <table class="category-table">
        <tbody>
          <tr>
            <th>ឈ្មោះប្រភេទ</th>
            <td>{{ category.category_name }}</td>
          </tr>
          <tr>
            <th>ពិពណ៌នា</th>
            <td>{{ category.description || '-' }}</td>
          </tr>
          <tr>
            <th>ថ្ងៃបង្កើត</th>
            <td>{{ formatDate(category.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </Dialog>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import Dialog from 'primevue/dialog'

const visible = ref(false)

defineProps({
  category: {
    type: Object,
    required: true
  }
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