<template>
  <div>
    <!-- SEARCH + ADD -->
    <div class="flex align-items-center gap-1 justify-content-between mb-1 btn">
      <div class="w-8">
        <IconField >
          <InputIcon class="pi pi-search" />
          <InputText v-model="searchTerm" class="w-full" placeholder="ស្វែងរកផលិតផល" />
        </IconField>
      </div>

      <div>
        <Button
          label="បញ្ចូលទំនិញ"
          severity="success"
          @click="checkLoginAndOpenAdd"
          class="p-1 py-2 w-full"
        />
      </div>
    </div>

    <!-- FILTER -->
    <div class="flex gap-2 mb-3 mx-3">
      <Select
        v-model="filterCategory"
        :options="categories"
        optionLabel="category_name"
        optionValue="id"
        placeholder="Filter by category"
        class="w-full"
      />
      <Button label="Clear" @click="clearFilter" />
    </div>

    <!-- ADD / EDIT DIALOG -->
    <Dialog
      v-model:visible="visible"
      modal
      :header="editingProduct ? 'កែប្រែផលិតផល' : 'បន្ថែមផលិតផល'"
      :style="{ width: '30rem' }"
    >
      <div class="mb-2">
        <label class="font-semibold w-24">ឈ្មោះ</label>
        <InputText v-model="productName" class="w-full mt-2" />
      </div>

      <div class="mb-2">
        <label class="font-semibold w-24">ប្រភេទ</label>
        <Select
          v-model="selectedCategory"
          :options="categories"
          optionLabel="category_name"
          optionValue="id"
          placeholder="ជ្រើសរើសប្រភេទ"
          class="w-full mt-2"
        />
      </div>

      <div class="mb-4">
        <label class="font-semibold w-24">តម្លៃ</label>
        <InputText v-model="productPrice" class="w-full mt-2" />
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
    <DataTable :value="filteredProducts" stripedRows :loading="loading">
        <template #empty>
    <div class="text-center p-3">
      មិនមានទិន្នន័យ
    </div>
  </template>
      <Column header="ល.រ">
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column field="product_name" header="ឈ្មោះ" />
      <Column field="price" header="តម្លៃ" />

      <Column v-if="!isMobile" header="ថ្ងៃបង្កើត">
        <template #body="slotProps">
          {{ new Date(slotProps.data.created_at).toLocaleDateString() }}
        </template>
      </Column>

      <Column headerClass="justify-content-end">
        <template #body="slotProps">
          <div class="flex gap-2 items-center align-items-center justify-content-end">
            <!-- Desktop: show full buttons -->
            <template v-if="!isMobile">
              <ProductView :product="slotProps.data" />
              <Button
                icon="pi pi-pencil"
                label="កែប្រែ"
                class="p-button-primary"
                :disabled="userRole !== 'admin'"
                @click="checkLoginAndEdit(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                label="លុប"
                class="p-button-danger"
                :disabled="userRole !== 'admin'"
                @click="checkLoginAndDelete(slotProps.data)"
              />
            </template>

            <!-- Mobile: show 3-dot menu -->
            <template v-else>
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
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'

import ProductView from '@/Product/ProductView.vue'
import ConfirmDialog from 'primevue/confirmdialog'
import Menu from 'primevue/menu'
import { useDevice } from '@/hook/useDevice.js'

const { isMobile } = useDevice()
const router = useRouter()

// STATE
const visible = ref(false)
const loading = ref(false)
const saving = ref(false)
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
const userRole = ref('') // track role
const filterCategory = ref(null)
const viewDialog = ref(false)
// const selectedProduct = ref(null)
  
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
  const { data } = await supabase.from('Category').select('id, category_name')
  categories.value = data || []
}

const getCurrentUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return profile?.role || null
}

// async login check
const checkLogin = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    router.push('/login')
    return false
  }
  // if role not loaded, load it
  if (!userRole.value) {
    userRole.value = await getCurrentUserRole()
  }
  return true
}

const checkLoginAndOpenAdd = async () => {
  const loggedIn = await checkLogin()
  if (!loggedIn) return
  if (userRole.value !== 'admin') {
    alert('អ្នកគ្មានសិទ្ធិបន្ថែម')
    return
  }
  openAdd()
}

const checkLoginAndEdit = async (product) => {
  const loggedIn = await checkLogin()
  if (!loggedIn) return
  if (userRole.value !== 'admin') {
    alert('អ្នកគ្មានសិទ្ធិកែប្រែ')
    return
  }
  openEdit(product)
}

const checkLoginAndDelete = async (product) => {
  const loggedIn = await checkLogin()
  if (!loggedIn) return
  if (userRole.value !== 'admin') {
    alert('អ្នកគ្មានសិទ្ធិលុប')
    return
  }
  deleteProduct(product)
}

const mobileMenu = (product, event) => {
  selectedProduct.value = product
  menuItems.value = [
    { label: 'Edit', icon: 'pi pi-pencil', disabled: userRole.value !== 'admin', command: () => checkLoginAndEdit(selectedProduct.value) },
    { label: 'Delete', icon: 'pi pi-trash', disabled: userRole.value !== 'admin', command: () => checkLoginAndDelete(selectedProduct.value) }
  ]
  menu.value.toggle(event)
}

function openView(product) {
  selectedProduct.value = product
  viewDialog.value = true
}

onMounted(async () => {
  await fetchProducts()
  await fetchCategories()
  // preload user role
  userRole.value = await getCurrentUserRole()
})

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchSearch = !searchTerm.value ||
      p.product_name?.toLowerCase().includes(searchTerm.value.toLowerCase())

    const matchCategory = !filterCategory.value ||
      p.category_id === filterCategory.value

    return matchSearch && matchCategory
  })
})

const clearFilter = () => {
  filterCategory.value = null
  searchTerm.value = ''
}

const openAdd = () => {
  editingProduct.value = null
  productName.value = ''
  productPrice.value = ''
  selectedCategory.value = null
  visible.value = true
}

const openEdit = (product) => {
  editingProduct.value = product
  productName.value = product.product_name
  productPrice.value = product.price
  selectedCategory.value = product.category_id
  visible.value = true
}

const closeDialog = () => {
  visible.value = false
  editingProduct.value = null
}

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
    result = await supabase.from('Product').update(payload).eq('id', editingProduct.value.id)
  } else {
    result = await supabase.from('Product').insert(payload)
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

const deleteProduct = async (product) => {
  if (!confirm('តើអ្នកចង់លុបផលិតផលនេះមែនទេ?')) return
  const { error } = await supabase.from('Product').delete().eq('id', product.id)
  if (!error) products.value = products.value.filter(p => p.id !== product.id)
}
</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn{
  padding: 12px;
}
</style>
