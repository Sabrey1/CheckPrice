<template>
  <div>
    <!-- SEARCH + ADD -->
    <div class="flex justify-content-between mb-3">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText v-model="searchTerm" placeholder="Search product" />
      </IconField>

      <Button
        label="បន្ថែមផលិតផល"
        icon="pi pi-plus"
        severity="success"
        @click="openAdd"
      />
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
        <Button label="Cancel" severity="secondary" @click="closeDialog" />
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
      tableStyle="min-width: 50rem"
    >
      <Column header="ល.រ">
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column field="product_name" header="ឈ្មោះ" />
      <Column field="price" header="តម្លៃ" />

      <Column header="ថ្ងៃបង្កើត">
        <template #body="slotProps">
          {{ new Date(slotProps.data.created_at).toLocaleDateString() }}
        </template>
      </Column>

      <Column header="សកម្មភាព" style="width: 340px">
        <template #body="slotProps">
          <div class="flex gap-2">
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
          </div>
        </template>
      </Column>
    </DataTable>
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

/* STATE */
const visible = ref(false)
const loading = ref(false)
const saving = ref(false)

const products = ref([])
const categories = ref([])

const productName = ref('')
const productPrice = ref('')
const selectedCategory = ref(null)

const editingProduct = ref(null)
const searchTerm = ref('')

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
