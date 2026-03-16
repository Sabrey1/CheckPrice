<template>
  <div>
    <!-- SEARCH + ADD -->
    <div class="flex align-items-center gap-1 justify-content-between mb-3 btn">
      <div class="w-8">
        <IconField>
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

    <!-- ADD / EDIT DIALOG -->
    <Dialog
      v-model:visible="visible"
      modal
      :header="editingProduct ? 'កែប្រែផលិតផល' : 'បន្ថែមផលិតផល'"
      :style="{ width: '30rem', margin: '1rem' }"
    >
      <div class="mb-2">
        <label class="font-semibold w-24 mb-2 pb-2">ឈ្មោះ</label>
        <br />
        <InputText v-model="productName" class="flex-auto w-full mt-1" />
      </div>

      <div class="mb-2">
        <label class="font-semibold w-24">ប្រភេទ</label>
        <Select
          v-model="selectedCategory"
          :options="categories"
          optionLabel="category_name"
          optionValue="id"
          placeholder="ជ្រើសរើសប្រភេទ"
          class="flex-auto w-full mt-1"
        />
      </div>

      <!-- Image Upload + Preview -->
      <div class="mb-2">
        <label class="font-semibold w-24">រូបភាព</label>
        <div class="mt-1">
          <FileUpload
            ref="fileUploadRef"
            mode="basic"
            accept="image/*"
            :maxFileSize="5000000"
            chooseLabel="ជ្រើសរើសរូបភាព"
            @select="onFileSelect"
          />
          <!-- New image preview -->
          <div v-if="imagePreview" class="mt-2">
            <img
              :src="imagePreview"
              alt="Preview"
              style="max-width: 100%; max-height: 150px; border-radius: 8px; object-fit: cover;"
            />
            <small class="text-color-secondary"> រូបភាពថ្មី</small>
          </div>
          <!-- Existing image when editing and no new image selected -->
          <div v-else-if="editingProduct?.image" class="mt-2">
            <img
              :src="editingProduct.image"
              alt="Current Image"
              style="max-width: 100%; max-height: 150px; border-radius: 8px; object-fit: cover;"
            />
            <small class="text-color-secondary"> រូបភាពបច្ចុប្បន្ន</small>
          </div>
        </div>
      </div>

      <div class="mb-2">
        <label class="font-semibold w-24">តម្លៃ</label>
        <InputText v-model="productPrice" class="flex-auto w-full mt-1" />
      </div>

      <div class="mb-4">
        <label class="font-semibold w-24">ពិពណ៌នា</label>
        <InputText v-model="description" class="flex-auto w-full mt-1" />
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
            <template v-if="!isMobile">
              <Button
                icon="pi pi-eye"
                label="បង្ហាញ"
                class="p-button-success"
                @click="openView(slotProps.data)"
              />
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

    <ProductView
      :product="selectedProduct"
      v-model:visible="showViewDialog"
    />
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
const description = ref('')
const selectedCategory = ref(null)
const editingProduct = ref(null)
const searchTerm = ref('')
const selectedProduct = ref(null)
const userRole = ref('')
const showViewDialog = ref(false)
const productImage = ref(null)
const imagePreview = ref(null)
const fileUploadRef = ref(null)   
 
const onFileSelect = (event) => {
  const file = event.files?.[0] ?? event.originalEvent?.target?.files?.[0] ?? null
  if (file) {
    productImage.value = file
    const reader = new FileReader()
    reader.onload = (e) => { imagePreview.value = e.target.result }
    reader.readAsDataURL(file)
  }
}
 
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
 
const checkLogin = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { router.push('/login'); return false }
  if (!userRole.value) userRole.value = await getCurrentUserRole()
  return true
}

const checkLoginAndOpenAdd = async () => {
  if (!await checkLogin()) return
  if (userRole.value !== 'admin') { alert('អ្នកគ្មានសិទ្ធិបន្ថែម'); return }
  openAdd()
}

const checkLoginAndEdit = async (product) => {
  if (!await checkLogin()) return
  if (userRole.value !== 'admin') { alert('អ្នកគ្មានសិទ្ធិកែប្រែ'); return }
  openEdit(product)
}

const checkLoginAndDelete = async (product) => {
  if (!await checkLogin()) return
  if (userRole.value !== 'admin') { alert('អ្នកគ្មានសិទ្ធិលុប'); return }
  deleteProduct(product)
}
 
const mobileMenu = (product, event) => {
  selectedProduct.value = product
  menuItems.value = [
    { label: 'View',   icon: 'pi pi-eye',    command: () => openView(selectedProduct.value) },
    { label: 'Edit',   icon: 'pi pi-pencil', disabled: userRole.value !== 'admin', command: () => checkLoginAndEdit(selectedProduct.value) },
    { label: 'Delete', icon: 'pi pi-trash',  disabled: userRole.value !== 'admin', command: () => checkLoginAndDelete(selectedProduct.value) }
  ]
  menu.value.toggle(event)
}

const openView = (product) => {
  selectedProduct.value = product
  showViewDialog.value = true
}
 
onMounted(async () => {
  await fetchProducts()
  await fetchCategories()
  userRole.value = await getCurrentUserRole()
})
 
const filteredProducts = computed(() => {
  if (!searchTerm.value) return products.value
  return products.value.filter(p =>
    p.product_name?.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})
 
const resetImageState = () => {
  productImage.value = null
  imagePreview.value = null
  fileUploadRef.value?.clear() 
}

const openAdd = () => {
  editingProduct.value = null
  productName.value = ''
  productPrice.value = ''
  selectedCategory.value = null
  description.value = ''
  resetImageState()
  visible.value = true
}

const openEdit = (product) => {
  editingProduct.value = product        
  productName.value = product.product_name     
  productPrice.value = String(product.price)    
  selectedCategory.value = product.category_id  
  description.value = product.description || ''
  resetImageState()                    
  visible.value = true
}

const closeDialog = () => {
  visible.value = false
  editingProduct.value = null
  resetImageState()
}
 
const saveProduct = async () => {
  if (!productName.value || !productPrice.value || !selectedCategory.value) {
    alert('សូមបំពេញព័ត៌មានទាំងអស់')
    return
  }

  saving.value = true
  let imageUrl = null

  if (productImage.value) {
    const sanitizedName = productImage.value.name
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '')
    const fileName = `${Date.now()}_${sanitizedName}`

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, productImage.value, {
        cacheControl: '3600',
        upsert: false,
        contentType: productImage.value.type
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      alert(`រូបភាពបញ្ចូលបរាជ័យ: ${uploadError.message}`)
      saving.value = false
      return
    }

    const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName)
    imageUrl = urlData?.publicUrl || null
  }

  const payload = {
    product_name: productName.value,
    price: productPrice.value,
    category_id: selectedCategory.value,
    description: description.value,
    image: imageUrl ?? (editingProduct.value?.image ?? null)
  }

  const result = editingProduct.value
    ? await supabase.from('Product').update(payload).eq('id', editingProduct.value.id)
    : await supabase.from('Product').insert(payload)

  if (!result.error) {
    await fetchProducts()
    closeDialog()
  } else {
    console.error('Save error:', result.error)
    alert(`រក្សាទុកបរាជ័យ: ${result.error.message}`)
  }

  saving.value = false
}
 
const deleteProduct = async (product) => {
  if (!confirm('តើអ្នកចង់លុបផលិតផលនេះមែនទេ?')) return
  const { error } = await supabase.from('Product').delete().eq('id', product.id)
  if (!error) {
    products.value = products.value.filter(p => p.id !== product.id)
  } else {
    alert(`លុបបរាជ័យ: ${error.message}`)
  }
}
</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn {
  padding: 12px;
}
</style>