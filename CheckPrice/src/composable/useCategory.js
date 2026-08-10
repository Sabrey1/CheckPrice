import { ref } from 'vue'
import axios from '../../services/axios.js'

const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const importing = ref(false)
const userRole = ref('')

const role_name = ref('')

export function useCategory() {
 
  async function getCategory() {
    loading.value = true

    const userString = localStorage.getItem('user')

    if (!userString) {
      console.log('User not found')
      loading.value = false
      return
    }

    const user = JSON.parse(userString)

    const branchId = user?.branch_id

    const response = await axios.get('/api/category', {
      params: {
        branch_id: branchId,
      },
    })

    if (response.data.success) {
      categories.value = response.data.data
    } else {
      console.error(
        response.data.message || 'Failed to get categories'
      )
    }

    loading.value = false
  }
 
  async function getCategoryById(id) {
    const response = await axios.get(
      `/api/category/${id}`
    )

    if (response.data.success) {
      return response.data.data
    }

    console.error(
      response.data.message || 'Failed to get category'
    )

    return null
  }
 
  async function createCategory(category) {
    saving.value = true

    const response = await axios.post(
      '/api/category',
      {
        name: category.category_name,
        description: category.description,
      }
    )

    saving.value = false

    if (response.data.success) {
      await getCategory()
      return response.data.data
    }

    console.error(
      response.data.message || 'Failed to create category'
    )

    return null
  }

  async function updateCategory(id, category) {
    saving.value = true

    const response = await axios.put(
      `/api/category/${id}`,
      {
        name: category.category_name,
        description: category.description,
      }
    )

    saving.value = false

    if (response.data.success) {
      await getCategory()
      return response.data.data
    }

    console.error(
      response.data.message || 'Failed to update category'
    )

    return null
  }
 
  async function deleteCategory(id) {
    const response = await axios.delete(
      `/api/category/${id}`
    )

    if (response.data.success) {
      await getCategory()
      return response.data.data
    }

    console.error(
      response.data.message || 'Failed to delete category'
    )

    return null
  }
 
  async function exportCategory() {
    try {
      const userString = localStorage.getItem('user')

      if (!userString) {
        console.error('User not found')
        return null
      }

      const user = JSON.parse(userString)
      const branchId = user?.branch_id

      if (!branchId) {
        console.error('Branch ID not found')
        return null
      }

      const response = await axios.get(
        '/api/category/export',
        {
          params: {
            branch_id: branchId,
          },
          responseType: 'blob',
        }
      )

      const blob = new Blob(
        [response.data],
        {
          type: 'text/csv;charset=utf-8;',
        }
      )

      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')

      link.href = url
      link.download = `categories_branch_${branchId}.csv`

      document.body.appendChild(link)

      link.click()

      link.remove()

      window.URL.revokeObjectURL(url)

      return true

    } catch (error) {
      console.error('Failed to export categories:', error)
      return null
    }
  }
 
  async function downloadCategoryTemplate() {
    const response = await axios.get(
      '/api/category/template',
      {
        responseType: 'blob',
      }
    )

    const blob = new Blob(
      [response.data],
      { type: 'text/csv;charset=utf-8;' }
    )

    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')

    link.href = url
    link.download = 'categories_template.csv'

    document.body.appendChild(link)

    link.click()

    link.remove()

    window.URL.revokeObjectURL(url)
  }
 
  async function importCategory(file) {
  if (!file) {
    return null
  }

  if (!file.name.toLowerCase().endsWith('.csv')) {
    console.error('Only CSV files are allowed')
    return null
  }

  importing.value = true

  const formData = new FormData()

  formData.append('file', file)

  const response = await axios.post(
    '/api/category/import',
    formData
  )

  importing.value = false

  if (response.data.success) {
    await getCategory()

    return response.data
  }

  console.error(
    response.data.message || 'Import failed'
  )

  return null
}
 
 async function getUserRole() {
  const user = localStorage.getItem('user')

  if (!user) {
    return null
  }

  const userRoles = JSON.parse(user)

  userRole.value =  userRoles.role_name || ''
 
  return userRole.value
}

  return {
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
  }
}

export default useCategory
