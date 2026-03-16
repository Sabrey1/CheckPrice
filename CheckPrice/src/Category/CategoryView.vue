<template>
  <Dialog
    v-model:visible="visible"
    header="ព័ត៌មានប្រភេទ"
    modal
    :style="{ width: '350px' }"
  >
    <div v-if="category">
      <p><strong>ID:</strong> {{ category.id }}</p>
      <p><strong>ឈ្មោះ:</strong> {{ category.category_name }}</p>
      <p><strong>ពិពណ៌នា:</strong> {{ category.description }}</p>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  category: Object,
  visible: Boolean
});

const emit = defineEmits(["update:visible"]);

const visible = ref(props.visible);

watch(() => props.visible, (val) => {
  visible.value = val;
});

watch(visible, (val) => {
  emit("update:visible", val);
});
</script>