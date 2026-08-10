<template>
  <div>
    <!-- SEARCH + ADD -->
    <div
      class="flex align-items-center gap-1 justify-content-between mb-1 btn"
    >
      <div class="w-5">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchTerm"
            class="w-full"
            placeholder="ស្វែងរកផលិតផល"
          />
        </IconField>
      </div>

      <div class="flex gap-2">
        <!-- ADD -->
        <Button
          label="បញ្ចូលទំនិញ"
          severity="success"
          :disabled="userRole !== 'admin'"
          @click="checkLoginAndOpenAdd"
        />

        <!-- IMPORT -->
        <Button
          label="នាំចូល CSV"
          icon="pi pi-upload"
          :loading="importing"
          :disabled="userRole !== 'admin'"
          @click="openImport"
        />

        <!-- EXPORT -->
        <Button
          label="នាំចេញ CSV"
          icon="pi pi-download"
          severity="success"
          :loading="exporting"
          @click="exportProductCsv"
        />

        <!-- TEMPLATE -->
        <Button
          label="Template"
          icon="pi pi-file"
          severity="secondary"
          :loading="downloadingTemplate"
          @click="downloadProductCsvTemplate"
        />
      </div>

      <!-- HIDDEN FILE INPUT -->
      <input
        ref="fileInput"
        type="file"
        accept=".csv"
        style="display: none"
        @change="handleImport"
      />
    </div>

    <!-- FILTER -->
    <div class="flex gap-2 mb-3 mx-3">
      <Select
        v-model="filterCategory"
        :options="categories"
        optionLabel="name"
        optionValue="id"
        placeholder="Filter by category"
        class="w-full"
      />

      <Button
        label="Clear"
        severity="secondary"
        @click="clearFilter"
      />
    </div>

    <!-- ADD / EDIT DIALOG -->
    <Dialog
      v-model:visible="visible"
      modal
      :header="editingProduct ? 'កែប្រែផលិតផល' : 'បន្ថែមផលិតផល'"
      :style="{ width: '30rem' }"
    >
      <!-- PRODUCT NAME -->
      <div class="mb-2">
        <label class="font-semibold w-24">
          ឈ្មោះ
        </label>

        <InputText
          v-model="productName"
          class="w-full mt-2"
          placeholder="បញ្ចូលឈ្មោះផលិតផល"
        />
      </div>

      <!-- CATEGORY -->
      <div class="mb-2">
        <label class="font-semibold w-24">
          ប្រភេទ
        </label>

        <Select
          v-model="selectedCategory"
          :options="categories"
          optionLabel="name"
          optionValue="id"
          placeholder="ជ្រើសរើសប្រភេទ"
          class="w-full mt-2"
        />
      </div>

      <!-- PRICE -->
      <div class="mb-4">
        <label class="font-semibold w-24">
          ថ្លៃដើម
        </label>

        <InputText
          v-model="costPrice"
          class="w-full mt-2"
          placeholder="បញ្ចូលថ្លៃដើម"
        />
      </div>
      <!-- PRICE -->
      <div class="mb-4">
        <label class="font-semibold w-24">
          តម្លៃ
        </label>

        <InputText
          v-model="productPrice"
          class="w-full mt-2"
          placeholder="បញ្ចូលតម្លៃ"
        />
      </div>
      <div class="mb-4">
        <label class="font-semibold w-24">
          ពិពណ៌នា
        </label>

        <InputText
          v-model="productDescription"
          class="w-full mt-2"
          placeholder="បញ្ចូលពិពណ៌នា"
        />
      </div>

      <!-- BUTTONS -->
      <div class="flex justify-content-end gap-2">
        <Button
          label="បោះបង់"
          severity="secondary"
          @click="closeDialog"
        />

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
      <template #empty>
        <div class="text-center p-3">
          មិនមានទិន្នន័យ
        </div>
      </template>

      <!-- NUMBER -->
      <Column header="ល.រ">
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <!-- NAME -->
      <Column
        field="name"
        header="ឈ្មោះ"
      />

      <!-- PRICE -->
      <Column
        field="sale_price"
        header="តម្លៃ"
      />

      <!-- CREATED DATE -->
      <Column
        v-if="!isMobile"
        header="ថ្ងៃបង្កើត"
      >
        <template #body="slotProps">
          {{
            slotProps.data.created_at
              ? new Date(slotProps.data.created_at).toLocaleDateString()
              : ''
          }}
        </template>
      </Column>

      <!-- ACTION -->
      <Column headerClass="justify-content-end">
        <template #body="slotProps">
          <div
            class="flex gap-2 items-center align-items-center justify-content-end"
          >
            <!-- DESKTOP -->
            <template v-if="!isMobile">
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

            <!-- MOBILE -->
            <template v-else>
              <div
                class="flex align-items-center justify-content-center rounded-full w-full"
              >
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

    <Menu
      ref="menu"
      :model="menuItems"
      :popup="true"
    />
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '../../services/axios.js'
import Menu from 'primevue/menu'
import ConfirmDialog from 'primevue/confirmdialog'
import { useDevice } from '@/hook/useDevice.js'
import { useProduct } from '@/composable/useProduct.js'
 
const { isMobile } = useDevice()

const {
  product,
  loading,
  importing,
  exporting,
  downloadingTemplate,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct: removeProduct,
  importProduct,
  exportProduct,
  downloadProductTemplate
} = useProduct()


const fileInput = ref(null)
const visible = ref(false)
const saving = ref(false)
const categories = ref([])
const menu = ref(null)
const menuItems = ref([])
const productName = ref('')
const costPrice = ref('')
const productPrice = ref('')
const selectedCategory = ref(null)
const productDescription = ref('')
const editingProduct = ref(null)
const searchTerm = ref('')
const filterCategory = ref(null)
const selectedProduct = ref(null)
const userRole = ref('')
const isLoggedIn = ref(false)
 
function getUser() {
  const userString = localStorage.getItem('user')
  if (!userString) {
    return null
  }

  try {
    return JSON.parse(userString)
  } catch (error) {
    console.error('Invalid user data:', error)
    return null
  }
}

function checkLogin() {
  const user = getUser()
  if (!user) {
    isLoggedIn.value = false
    return false
  }

  isLoggedIn.value = true
  userRole.value = user?.role_name || ''
  return true
}
 
async function getCategories() {
  const user = getUser()
  if (!user?.branch_id) {
    categories.value = []
    return
  }

  try {
    const res = await axios.get('api/category', {
      params: {
        branch_id: user.branch_id
      }
    })

    if (res.data.success) {
      categories.value = res.data.data || []
    } else {
      categories.value = []
    }
  } catch (error) {
    console.error('Get categories error:', error)
    categories.value = []
  }
}
 
function openImport() {
  if (userRole.value !== 'admin') {
    alert('អ្នកគ្មានសិទ្ធិនាំចូលទំនិញ')
    return
  }

  fileInput.value?.click()
}

async function handleImport(event) {
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  try {
    const result = await importProduct(file)

    console.log('Import result:', result)

    if (result?.success) {
      alert('នាំចូលទំនិញបានជោគជ័យ')
    } else {
      alert(result?.message || 'នាំចូលទំនិញមិនបានជោគជ័យ')
    }
  } catch (error) {
    console.error('Import error:', error)

    alert(
      error?.response?.data?.message ||
      error?.message ||
      'Import failed'
    )
  }

  event.target.value = ''
}
 
async function exportProductCsv() {
  try {
    await exportProduct()
  } catch (error) {
    console.error('Export error:', error)

    alert(
      error?.response?.data?.message ||
      error?.message ||
      'Export failed'
    )
  }
}
async function downloadProductCsvTemplate() {
  try {
    await downloadProductTemplate()
  } catch (error) {
    console.error('Template error:', error)

    alert(
      error?.response?.data?.message ||
      error?.message ||
      'Template download failed'
    )
  }
}

function checkLoginAndOpenAdd() {
  if (!checkLogin()) {
    alert('សូម Login ជាមុនសិន')
    return
  }

  if (userRole.value !== 'admin') {
    alert('អ្នកគ្មានសិទ្ធិបន្ថែមផលិតផល')
    return
  }

  openAdd()
}

function checkLoginAndEdit(item) {
  if (!checkLogin()) {
    alert('សូម Login ជាមុនសិន')
    return
  }

  if (userRole.value !== 'admin') {
    alert('អ្នកគ្មានសិទ្ធិកែប្រែផលិតផល')
    return
  }
  openEdit(item)
}

function checkLoginAndDelete(item) {
  if (!checkLogin()) {
    alert('សូម Login ជាមុនសិន')
    return
  }

  if (userRole.value !== 'admin') {
    alert('អ្នកគ្មានសិទ្ធិលុបផលិតផល')
    return
  }

  deleteProduct(item)
}

function openAdd() {
  editingProduct.value = null

  productName.value = ''
  costPrice.value = ''
  productPrice.value = ''
  selectedCategory.value = null
  productDescription.value = ''

  visible.value = true
}

function openEdit(item) {
  editingProduct.value = item

  productName.value = item.name || ''
  costPrice.value = item.cost_price ?? ''
  productPrice.value = item.sale_price ?? ''
 selectedCategory.value = item.category_id ?? null
  productDescription.value = item.description

  visible.value = true
}

function closeDialog() {
  visible.value = false

  editingProduct.value = null

  productName.value = ''
  costPrice.value = ''
  productPrice.value = ''
  selectedCategory.value = null
  productDescription.value = ''
}

async function saveProduct() {
  if (!productName.value.trim()) {
    alert('សូមបញ្ចូលឈ្មោះផលិតផល')
    return
  }

  if (
    productPrice.value === '' ||
    productPrice.value === null
  ) {
    alert('សូមបញ្ចូលតម្លៃ')
    return
  }

  if (!selectedCategory.value) {
    alert('សូមជ្រើសរើសប្រភេទ')
    return
  }

  saving.value = true

  try {
    const payload = {
      name: productName.value.trim(),
      sale_price: Number(productPrice.value), 
      cost_price: Number(costPrice.value),
      description: productDescription.value,
      category_id: Number(selectedCategory.value)
    }

    let result

    // UPDATE
    if (editingProduct.value) {
      result = await updateProduct(
        editingProduct.value.id,
        payload
      )
    }

    // CREATE
    else {
      result = await createProduct(payload)
    }

    if (result?.success) {
      closeDialog()
    } else {
      alert(
        result?.message ||
        'រក្សាទុកផលិតផលមិនបានជោគជ័យ'
      )
    }
  } catch (error) {
    console.error('Save product error:', error)

    alert(
      error?.response?.data?.message ||
      error?.message ||
      'Save failed'
    )
  } finally {
    saving.value = false
  }
}

async function deleteProduct(item) {
  if (!item?.id) {
    return
  }

  const confirmed = confirm(
    `តើអ្នកចង់លុបផលិតផល "${item.name}" មែនទេ?`
  )

  if (!confirmed) {
    return
  }

  try {
    const result = await removeProduct(item.id)

    if (!result?.success) {
      alert(
        result?.message ||
        'លុបផលិតផលមិនបានជោគជ័យ'
      )
    }
  } catch (error) {
    console.error('Delete product error:', error)

    alert(
      error?.response?.data?.message ||
      error?.message ||
      'Delete failed'
    )
  }
}

function mobileMenu(item, event) {
  selectedProduct.value = item

  menuItems.value = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      disabled: userRole.value !== 'admin',
      command: () => {
        checkLoginAndEdit(selectedProduct.value)
      }
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      disabled: userRole.value !== 'admin',
      command: () => {
        checkLoginAndDelete(selectedProduct.value)
      }
    }
  ]

  menu.value?.toggle(event)
}

const filteredProducts = computed(() => {
  return product.value.filter((item) => {
    const search = searchTerm.value.trim().toLowerCase()

    const matchSearch =
      !search ||
      item.name
        ?.toLowerCase()
        .includes(search)

    const matchCategory =
      !filterCategory.value ||
      Number(item.category_id) ===
        Number(filterCategory.value)

    return matchSearch && matchCategory
  })
})

function clearFilter() {
  filterCategory.value = null
  searchTerm.value = ''
}
 
onMounted(async () => {
  checkLogin()

  await Promise.all([
    getProduct(),
    getCategories()
  ])
})
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