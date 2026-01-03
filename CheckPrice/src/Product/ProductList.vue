<template>
  <div>
    
    <!-- SEARCH + ADD -->
    <div class="flex align-items-center gap-2 justify-content-between mb-3 p-3">
      <div>
         <IconField>
        <InputIcon class="pi pi-search" />
        <InputText v-model="searchTerm" placeholder="ស្វែងរកផលិតផល" />
      </IconField>
      </div>
     

      <div>
        <Button
        label="បន្ថែមផលិតផល"
        icon="pi pi-plus"
        severity="success"
        @click="openAdd"
      />
      </div>
      
    </div>

    <!-- ADD / EDIT DIALOG -->
    <Dialog
      v-model:visible="visible"
      modal
      :header="editingProduct ? 'កែប្រែផលិតផល' : 'បន្ថែមផលិតផល'"
      :style="{ width: '30rem' }"
    >
      <div class="flex items-center gap-4 mb-2">
        <label class="font-semibold w-24">ឈ្មោះ</label>
        <InputText v-model="productName" class="flex-auto" />
      </div>

      <div class="flex items-center gap-2 mb-2">
        <label class="font-semibold w-24">ប្រភេទ</label>
        <Select
          v-model="selectedCategory"
          :options="categories"
          optionLabel="category_name"
          optionValue="id"
          placeholder="ជ្រើសរើសប្រភេទ"
          class="flex-auto"
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label class="font-semibold w-24">តម្លៃ</label>
        <InputText v-model="productPrice" class="flex-auto" />
      </div>

      <div class="flex justify-end gap-2">
        <Button label="បោះបង់" severity="secondary" @click="closeDialog" />
        <Button
          :label="editingProduct ? 'កែប្រែ' : 'រក្សាទុក'"
          :loading="saving"
          @click="saveProduct"
        />
      </div>
    </Dialog>

    <!-- TABLE -->
    <DataTable
      :value="filteredProducts"
      stripedRows
      :loading="loading"
     
    >
      <Column header="ល.រ">
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column field="product_name" header="ឈ្មោះ" />
      <Column field="price" header="តម្លៃ" />

      <Column v-if="!isMobile" header="ថ្ងៃបង្កើត"  >
        <template #body="slotProps">
          {{ new Date(slotProps.data.created_at).toLocaleDateString() }}
        </template>
      </Column>

      
      <Column    headerClass=" justify-content-end  "   >
        <template #body="slotProps">
          <div class="flex gap-2 items-center align-items-center justify-content-end" >
            <!-- Desktop: show full buttons -->
            <template v-if="!isMobile">
              <ProductView :product="slotProps.data" />
              <Button
              icon="pi pi-pencil"
              label="កែប្រែ"
              class="p-button-primary"
              @click="openEdit(slotProps.data)"
            />
              <Button
              icon="pi pi-trash"
              label="លុប"
              class="p-button-danger"
              @click="deleteProduct(slotProps.data)"
            />
            </template>

            <!-- Mobile: show 3-dot menu -->
            <template v-else >
              <div class="flex align-items-center justify-content-center rounded-full w-full">
                <Button
                icon="pi pi-ellipsis-v"
                text
                rounded
                @click="mobileMenu(slotProps.data, $event)"
              />
              </div>
              
            </template>
          </div>
        </template>
      </Column>
    </DataTable>

    <ConfirmDialog />
    <Menu ref="menu" :model="menuItems" :popup="true" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Select from 'primevue/select'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import ProductView from '@/Product/ProductView.vue'
import ConfirmDialog from 'primevue/confirmdialog'
// import { useConfirm } from 'primevue/useconfirm'

import Menu from 'primevue/menu'
import {useDevice} from '@/hook/useDevice.js'

const { isMobile, deviceName } = useDevice()
/* STATE */
const visible = ref(false)
const loading = ref(false)
const saving = ref(false)
// const confirm = useConfirm()
const products = ref([])
const categories = ref([])
const menu = ref(null)
const menuItems = ref([])
const productName = ref('')
const productPrice = ref('')
const selectedCategory = ref(null)

const editingProduct = ref(null)
const searchTerm = ref('')
const selectedProduct = ref(null)

const mobileMenu = (product, event) => {
  selectedProduct.value = product
  
   
  menuItems.value = [
    // {
    //   label: 'មើល',
    //   icon: 'pi pi-eye',
    //   command: () => openView(selectedCategory.value)
    // },
    {
      label: 'កែប្រែ',
      icon: 'pi pi-pencil',
      command: () => openEdit(selectedProduct.value)
    },
    {
      label: 'លុប',
      icon: 'pi pi-trash',
      command: () => deleteProduct(selectedProduct.value)
    }
  ]

  menu.value.toggle(event) 
}


/* FETCH DATA */
const fetchProducts = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('Product')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error) products.value = data
  loading.value = false
}

const fetchCategories = async () => {
  const { data } = await supabase
    .from('Category')
    .select('id, category_name')

  categories.value = data || []
}

onMounted(async () => {
  await fetchProducts()
  await fetchCategories()
})

/* SEARCH */
const filteredProducts = computed(() => {
  if (!searchTerm.value) return products.value
  return products.value.filter(p =>
    p.product_name?.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

/* OPEN ADD */
const openAdd = () => {
  editingProduct.value = null
  productName.value = ''
  productPrice.value = ''
  selectedCategory.value = null
  visible.value = true
}

/* OPEN EDIT */
const openEdit = (product) => {
  editingProduct.value = product
  productName.value = product.product_name
  productPrice.value = product.price
  selectedCategory.value = product.category_id
  visible.value = true
}

/* CLOSE */
const closeDialog = () => {
  visible.value = false
  editingProduct.value = null
}

/* SAVE (ADD / UPDATE) */
const saveProduct = async () => {
  if (!productName.value || !productPrice.value || !selectedCategory.value) {
    alert('សូមបំពេញព័ត៌មានទាំងអស់')
    return
  }

  saving.value = true

  const payload = {
    product_name: productName.value,
    price: productPrice.value,
    category_id: selectedCategory.value
  }

  let result

  if (editingProduct.value) {
    // UPDATE
    result = await supabase
      .from('Product')
      .update(payload)
      .eq('id', editingProduct.value.id)
  } else {
    // INSERT
    result = await supabase
      .from('Product')
      .insert(payload)
  }

  if (!result.error) {
    await fetchProducts()
    closeDialog()
  } else {
    console.error(result.error)
    alert('Save failed')
  }

  saving.value = false
}

/* DELETE */
const deleteProduct = async (product) => {
  if (!confirm('តើអ្នកចង់លុបផលិតផលនេះមែនទេ?')) return

  const { error } = await supabase
    .from('Product')
    .delete()
    .eq('id', product.id)

  if (!error) {
    products.value = products.value.filter(p => p.id !== product.id)
  }
}
</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>