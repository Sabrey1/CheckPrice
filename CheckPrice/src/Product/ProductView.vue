<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="ព័ត៌មានផលិតផល"
    :style="{ width: '30rem', margin: '1rem' }"
  >
    <table class="category-table">
      <tbody>
        <!-- <tr>
          <th>រូបភាព</th>
          <td>{{ product?.image || '-' }}</td>
        </tr> -->
        <tr>
          <th>ឈ្មោះ</th>
          <td>{{ product?.product_name }}</td>
        </tr>
        <tr>
          <th>តម្លៃ</th>
          <td>{{ product?.price || '-' }}</td>
        </tr>
        <tr>
          <th>ថ្ងៃបង្កើត</th>
          <td>{{ formatDate(product?.created_at) }}</td>
        </tr>
      </tbody>
    </table>
  </Dialog>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  product: Object,
  visible: Boolean
})

const emit = defineEmits(["update:visible"])

const visible = computed({
  get: () => props.visible,
  set: (v) => emit("update:visible", v)
})

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : "-"
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