<template>
  <div>

    <div class="flex justify-content-between">
      <div>
        <IconField>
            <InputIcon class="pi pi-search" />
            <InputText v-model="searchTerm" placeholder="Search" />
        </IconField>
      </div>
        

        <div  >
          
       
        <Button label="បន្ថែមប្រភេទ" icon="pi pi-plus" severity="success" class="mb-3 " @click="openAdd" />
        <Dialog
      v-model:visible="visible"
      modal
      :header="editingCategory ? 'កែប្រែប្រភេទ' : 'បន្ថែមប្រភេទ'"
      :style="{ width: '30rem' }"
    >
      <div class="flex items-center gap-4 mb-4">
        <label class="font-semibold w-24">ឈ្មោះ</label>
        <InputText v-model="categoryName" class="flex-auto" />
      </div>

      <div class="flex items-center gap-4 mb-8">
        <label class="font-semibold w-24">ពិពណ៌នា</label>
        <InputText v-model="description" class="flex-auto" />
      </div>

      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="closeDialog"
        />
        <Button
          type="button"
          :label="editingCategory ? 'កែប្រែ' : 'រក្សាទុក'"
          :loading="saving"
          @click="saveCategory"
        />
      </div>
    </Dialog>
    
    </div>
   </div>
    

    <DataTable :value="filteredProducts" stripedRows :loading="loading" tableStyle="min-width: 50rem">
      <Column  header="ល.រ">
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>
      <Column header="រូបភាព">
        <template #body="slotProps">
        <Avatar 
            v-if="slotProps.data.image" 
            :src="slotProps.data.image" 
            class="mr-2" 
            size="xlarge" 
            shape="circle" 
        />
        <Avatar 
            v-else 
            :label="slotProps.data.product_name ? slotProps.data.product_name.charAt(0).toUpperCase() : 'P'" 
            class="mr-2" 
            size="xlarge" 
            shape="circle" 
        />
        </template>
 
      </Column>
      <Column field="product_name" header="ឈ្មោះ"></Column>
      <Column field="price" header="តម្លៃ"></Column>
      <Column header="ថ្ងៃបង្កើត">
        <template #body="slotProps">
          {{ new Date(slotProps.data.created_at).toLocaleDateString() }}
        </template>
      </Column>
      <Column header="សកម្មភាព" style="width: 370px">
        <template #body="slotProps">
          <div class="flex gap-2">
              <ProductView :product="slotProps.data"  />
              <Button icon="pi pi-pencil" label="កែប្រែ" class=" p-button-primary mr-2"></Button>
              <Button icon="pi pi-trash" label="លុប" class=" p-button-danger mr-2"></Button>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Avatar from 'primevue/avatar';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog'

import ProductView from '@/Product/ProductView.vue'

const visible = ref(false)
const products = ref([])
const loading = ref(false)
const searchTerm = ref('') 
const editingCategory = ref(null) 

const categoryName = ref('')
const description = ref('')
onMounted(async () => {
    loading.value = true

  const { data, error } = await supabase
    .from('Product')
    .select('*')

  if (error) {
    console.error(error)
  } else {
    products.value = data
  }
  loading.value = false 
})

const filteredProducts = computed(() => {
  if (!searchTerm.value) return products.value
  return products.value.filter(p => 
    p.product_name?.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

const openAdd = () => {
  editingCategory.value = null
  categoryName.value = ''
  description.value = ''
  visible.value = true
}


const openEdit = (category) => {
  editingCategory.value = category
  categoryName.value = category.category_name
  description.value = category.description
  visible.value = true
}
</script>
