
import { ref } from 'vue'
import axios from '../../services/axios.js'

const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const userRole = ref('')
 

export function useCategory() {

  // =========================
  // GET ALL CATEGORIES
  // =========================
  async function getCategory() {
    loading.value = true

    const userString = localStorage.getItem('user')

    if (!userString) {
      console.log('User not found')
      return
    }

    const user = JSON.parse(userString)

    const branchId = user?.branch_id

    const response = await axios.get('api/category',{
      params: {
        branch_id: branchId,
      },
    })

    if (response.data.success) {
      categories.value = response.data.data
    } else {
      console.error(response.data.message || 'Failed to get categories')
    }

    loading.value = false
  }

  // =========================
  // GET CATEGORY BY ID
  // =========================
  async function getCategoryById(id) {
    const response = await axios.get('/api/category/${id}')

    if (response.data.success) {
      return response.data.data
    }

    console.error(response.data.message || 'Failed to get category')

    return null
  }

  // =========================
  // CREATE CATEGORY
  // =========================
  async function createCategory(category) {
    saving.value = true

    const response = await axios.post(
      '/api/category',
      {
        category_name: category.category_name,
        description: category.description,
      }
    )

    saving.value = false

    if (response.data.success) {
      await getCategory()
      return response.data.data
    }

    console.error(response.data.message || 'Failed to create category')

    return null
  }

  // =========================
  // UPDATE CATEGORY
  // =========================
  async function updateCategory(id, category) {
    saving.value = true

    const response = await axios.put(
       '/api/category/${id}',
      {
        category_name: category.category_name,
        description: category.description,
      }
    )

    saving.value = false

    if (response.data.success) {
      await getCategory()
      return response.data.data
    }

    console.error(response.data.message || 'Failed to update category')

    return null
  }

  // =========================
  // DELETE CATEGORY
  // =========================
  async function deleteCategory(id) {
    const response = await axios.delete(
       '/api/category/${id}'
    )

    if (response.data.success) {
      await getCategory()
      return response.data.data
    }

    console.error(response.data.message || 'Failed to delete category')

    return null
  }

  // =========================
  // GET USER ROLE
  // =========================
  async function getUserRole() {
    const role = localStorage.getItem('userRole')

    if (role) {
      userRole.value = role
    } else {
      userRole.value = 'user'
    }

    return userRole.value
  }

  return {
    categories,
    loading,
    saving,
    userRole,

    getCategory,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getUserRole,
  }
}

export default useCategory
