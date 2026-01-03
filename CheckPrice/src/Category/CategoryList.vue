<template>
  <div>
    <Toast />
     <div class="flex justify-content-end p-3">
      <Button label="បន្ថែមប្រភេទ" icon="pi pi-plus" severity="success" class="mb-3 " @click="openAdd" />
     </div>
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

    <!-- TABLE -->
    <DataTable
      :value="categories"
      stripedRows
      :loading="loading"
      
    >
      <Column header="ល.រ">
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column field="category_name" class="p-0" header="ឈ្មោះប្រភេទ" />
      <Column field="description" v-if="!isMobile" header="ពិពណ៌នា" />

      <Column
        v-if="!isMobile"
        header="ថ្ងៃបង្កើត"
      >
        <template #body="slotProps">
          {{ new Date(slotProps.data.created_at).toLocaleDateString() }}
        </template>
      </Column>

      <Column class="p-0"  headerClass=" justify-content-end flex"   >
        <template #body="slotProps">
          <div class="flex gap-2 items-center align-items-center justify-content-end" >
            <!-- Desktop: show full buttons -->
            <template v-if="!isMobile">
              <CategoryView :category="slotProps.data" />
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
                @click="confirmDelete(slotProps.data)"
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
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { useToast } from 'primevue/usetoast'
import { useDevice } from '@/hook/useDevice.js'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'

import CategoryView from '@/Category/CategoryView.vue'

import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

import Menu from 'primevue/menu'

 
const { isMobile, deviceName } = useDevice()

const toast = useToast()
const confirm = useConfirm()

const visible = ref(false)
const categories = ref([])
const loading = ref(false)
const saving = ref(false)

const categoryName = ref('')
const description = ref('')
const editingCategory = ref(null) 

const menu = ref(null)
const menuItems = ref([])
const selectedCategory = ref(null)

const mobileMenu = (category, event) => {
  selectedCategory.value = category
  
   
  menuItems.value = [
    // {
    //   label: 'មើល',
    //   icon: 'pi pi-eye',
    //   command: () => openView(selectedCategory.value)
    // },
    {
      label: 'កែប្រែ',
      icon: 'pi pi-pencil',
      command: () => openEdit(selectedCategory.value)
    },
    {
      label: 'លុប',
      icon: 'pi pi-trash',
      command: () => confirmDelete(selectedCategory.value)
    }
  ]

  menu.value.toggle(event) 
}

onMounted(async () => {
  loading.value = true

  const { data, error } = await supabase
    .from('Category')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error) {
    categories.value = data
  } else {
    console.error(error)
  }

  loading.value = false
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

const closeDialog = () => {
  visible.value = false
  editingCategory.value = null
}

const saveCategory = async () => {
  if (!categoryName.value) {
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
    if (editingCategory.value) {
      const { error } = await supabase
        .from('Category')
        .update({
          category_name: categoryName.value,
          description: description.value
        })
        .eq('id', editingCategory.value.id)

      if (error) throw error
      const index = categories.value.findIndex(
        c => c.id === editingCategory.value.id
      )
      if (index !== -1) {
        categories.value[index].category_name = categoryName.value
        categories.value[index].description = description.value
      }

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'បានកែប្រែជោគជ័យ',
        life: 3000
      })
    }
   
    else {
      const { data, error } = await supabase
        .from('Category')
        .insert({
          category_name: categoryName.value,
          description: description.value
        })
        .select()
        .single()

      if (error) throw error

      categories.value.unshift(data)

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
    console.error(err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message,
      life: 4000
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (category) => {
  confirm.require({
    message: 'តើអ្នកពិតជាចង់លុបប្រភេទនេះមែនទេ?',
    header: 'បញ្ជាក់ការលុប',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'លុប',
    rejectLabel: 'បោះបង់',
    accept: () => deleteCategory(category)
  })
}

const deleteCategory = async (category) => {
  try {
    loading.value = true

    const { error } = await supabase
      .from('Category')
      .delete()
      .eq('id', category.id)

    if (error) throw error
    categories.value = categories.value.filter(
      c => c.id !== category.id
    )

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'បានលុបជោគជ័យ',
      life: 3000
    })

  } catch (err) {
    console.error(err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message,
      life: 4000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
  .align-middle {
  vertical-align: middle;
}
</style>