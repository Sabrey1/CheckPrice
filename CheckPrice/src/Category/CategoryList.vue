<template>
  <div>
    <Toast />
    <div class="flex justify-content-end p-3">
      <div class="flex gap-2">
          <Button
            label="បន្ថែមប្រភេទ"
            icon="pi pi-plus"
            severity="success"
            
            @click="checkLoginAndOpenAdd"
          />

          <Button
            label="នាំចូល CSV"
            icon="pi pi-upload"
            :loading="importing"
            :disabled="userRole !== 'admin' || 'Admin'"
            @click="openImport"
          />

          <Button
            label="នាំចេញ CSV"
            icon="pi pi-download"
            severity="success"
            @click="exportCategory"
          />

          <Button
            label="Template"
            icon="pi pi-file"
            severity="secondary"
            @click="downloadCategoryTemplate"
          />

        </div>

        <input
          ref="fileInput"
          type="file"
          accept=".csv"
          style="display: none"
          @change="handleImport"
        />
    </div>

    <!-- Add / Edit Dialog -->
    <Dialog
      v-model:visible="visible"
      modal
      :header="editingCategory ? 'កែប្រែប្រភេទ' : 'បន្ថែមប្រភេទ'"
      :style="{ width: '30rem' }"
    >
      <div class="mb-4">
        <label class="font-semibold w-24">ឈ្មោះ</label>
        <InputText v-model="categoryName" class="w-full mt-2" />
      </div>

      <div class="mb-4">
        <label class="font-semibold w-24">ពិពណ៌នា</label>
        <InputText v-model="description" class="w-full mt-2" />
      </div>

      <div class="flex justify-end gap-2">
        <Button type="button" label="បោះបង់" severity="secondary" @click="closeDialog" />
        <Button
          type="button"
          :label="editingCategory ? 'កែប្រែ' : 'រក្សាទុក'"
          :loading="saving"
          @click="saveCategory"
        />
      </div>
    </Dialog>

    <!-- Category Table -->
    <DataTable :value="categories" stripedRows :loading="loading">
      <Column header="ល.រ">
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column field="name" class="p-0" header="ឈ្មោះប្រភេទ" />
      <Column field="description" v-if="!isMobile" header="ពិពណ៌នា" />

      <Column v-if="!isMobile" header="ថ្ងៃបង្កើត">
        <template #body="slotProps">
          {{ new Date(slotProps.data.created_at).toLocaleDateString() }}
        </template>
      </Column>

      <Column class="p-0" headerClass="justify-content-end">
        <template #body="slotProps">
          <div class="flex gap-2 items-center justify-content-end">
            <!-- Desktop Buttons -->
            <template v-if="!isMobile">
              <CategoryView :category="slotProps.data" />
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
                severity="danger"
                class="p-button-primary"
                :disabled="userRole !== 'admin'"
                @click="checkLoginAndDelete(slotProps.data)"
              />

            </template>

            <!-- Mobile menu -->
            <template v-else>
              <Button
                icon="pi pi-ellipsis-v"
                text
                rounded
                @click="mobileMenu(slotProps.data, $event)"
              />
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
import { ref, onMounted,onBeforeUnmount  } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useDevice } from '@/hook/useDevice.js'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import CategoryView from '@/Category/CategoryView.vue'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import Menu from 'primevue/menu'

import { useCategory } from '@/composable/useCategory'

const {
  categories,
  loading,
  saving,
  importing,
  userRole,

  getCategory,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,

  exportCategory,
  downloadCategoryTemplate,
  importCategory,

  getUserRole,
} = useCategory()

const fileInput = ref(null)

const { isMobile } = useDevice()
const toast = useToast()
const confirm = useConfirm()
const router = useRouter()

// Table / Dialog state
const visible = ref(false)  

const categoryName = ref('')
const description = ref('')
const editingCategory = ref(null)

// Mobile menu
const menu = ref(null)
const menuItems = ref([])
const selectedCategory = ref(null)

onMounted(async () => {
  window.addEventListener('resize', isMobile)
  await getUserRole()
  await getCategory() 
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', isMobile)
})

const openImport = () => {
  fileInput.value?.click()
}

const handleImport = async (event) => {
  const file = event.target.files[0]

  if (!file) {
    return
  }

  const result = await importCategory(file)

  if (result?.success) {
    alert(
      `Import completed!\n\n` +
      `Total: ${result.total}\n` +
      `Inserted: ${result.inserted}\n` +
      `Skipped: ${result.skipped}`
    )
  }

  // Allow selecting the same file again
  event.target.value = ''
}


const checkLogin = () => {
  const role = userRole.value || localStorage.getItem('userRole')
  if (!role) {
    router.push('/login')
    return false
  }
  return true
}

const checkLoginAndOpenAdd = () => {
  if (!checkLogin()) return
  if (userRole.value !== 'admin') {
    toast.add({ severity: 'warn', summary: 'Access Denied', detail: 'អ្នកគ្មានសិទ្ធិបន្ថែម', life: 3000 })
    return
  }
  openAdd()
}

const checkLoginAndEdit = (category) => {
  if (!checkLogin()) return
  if (userRole.value !== 'admin') {
    toast.add({ severity: 'warn', summary: 'Access Denied', detail: 'អ្នកគ្មានសិទ្ធិកែប្រែ', life: 3000 })
    return
  }
  openEdit(category)
}

const checkLoginAndDelete = (category) => {
  if (!checkLogin()) return
  if (userRole.value !== 'admin') {
    toast.add({ severity: 'warn', summary: 'Access Denied', detail: 'អ្នកគ្មានសិទ្ធិលុប', life: 3000 })
    return
  }
  confirmDelete(category)
}

const openAdd = () => {
  editingCategory.value = null
  categoryName.value = ''
  description.value = ''
  visible.value = true
}

const openEdit = (category) => {
  editingCategory.value = category
  categoryName.value = category.name
  description.value = category.description
  visible.value = true
}

const closeDialog = () => {
  visible.value = false
  editingCategory.value = null
}

const saveCategory = async () => {
  if (!categoryName.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'សូមបញ្ចូលឈ្មោះប្រភេទ',
      life: 3000
    })
    return
  }

  try {
    saving.value = true

    const categoryData = {
      category_name: categoryName.value.trim(),
      branch_id: userRole.value === 'admin' ? null : localStorage.getItem('branch_id'),
      description: description.value.trim()
    }

    // Update existing category
    if (editingCategory.value) {
      const result = await updateCategory(
        editingCategory.value.id,
        categoryData
      )

      if (!result) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'មិនអាចកែប្រែប្រភេទបានទេ',
          life: 4000
        })
        return
      }

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'បានកែប្រែជោគជ័យ',
        life: 3000
      })

    } else {
      // Create new category
      const result = await createCategory(categoryData)

      if (!result) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'មិនអាចបន្ថែមប្រភេទបានទេ',
          life: 4000
        })
        return
      }

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'បានរក្សាទុកជោគជ័យ',
        life: 3000
      })
    }

    closeDialog()

    categoryName.value = ''
    description.value = ''

  } catch (err) {
    console.error('Save category error:', err)

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err?.message || 'មានបញ្ហាក្នុងការរក្សាទុកប្រភេទ',
      life: 4000
    })

  } finally {
    saving.value = false
  }
}


// Delete Category
const confirmDelete = (category) => {
  confirm.require({
    message: `តើអ្នកពិតជាចង់លុប "${category.name}" មែនទេ?`,
    header: 'បញ្ជាក់ការលុប',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'លុប',
    rejectLabel: 'បោះបង់',

    accept: async () => {
      const result = await deleteCategory(category.id)

      if (result) {
        toast.add({
          severity: 'success',
          summary: 'ជោគជ័យ',
          detail: 'បានលុបប្រភេទជោគជ័យ',
          life: 3000
        })
      }
    }
  })
}
 
const mobileMenu = (category, event) => {
  selectedCategory.value = category
  menuItems.value = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      disabled: userRole.value !== 'admin',
      command: () => checkLoginAndEdit(selectedCategory.value)
    },
  ]
  menu.value.toggle(event)
}

const openView = (category) => {
  if (!checkLogin()) return
  CategoryView.open(category)
}
</script>

<style scoped>
.align-middle {
  vertical-align: middle;
}
</style>
