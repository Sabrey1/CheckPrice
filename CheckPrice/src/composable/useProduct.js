// import { ref } from 'vue'
// import axios from '../../services/axios.js'
// const product = ref([])

// export function useProduct(){
//     async function getProduct() {
//     const userString = localStorage.getItem('user')

//     if (!userString) {
//       console.log('User not found')
//       return
//     }

//     const user = JSON.parse(userString)

//     const branchId = user?.branch_id
 
//     const res = await axios.get('api/product', {
//       params: {
//         branch_id: branchId,
//       },
//     })

//     if (res.data.success) {
//       product.value = res.data.data
//     }
//   }


//     return {
//         product,
//         getProduct
//     }
// }

import { ref } from 'vue'
import axios from '../../services/axios.js'

const product = ref([])
const loading = ref(false)
const importing = ref(false)
const exporting = ref(false)
const downloadingTemplate = ref(false)
const error = ref(null)

export function useProduct() {

  // =========================
  // USER
  // =========================

  function getUser() {
    const userString = localStorage.getItem('user')

    if (!userString) {
      console.log('User not found')
      return null
    }

    try {
      return JSON.parse(userString)
    } catch (err) {
      console.error('Invalid user data:', err)
      return null
    }
  }

  // =========================
  // BRANCH ID
  // =========================

  function getBranchId() {
    const user = getUser()

    if (!user) {
      return null
    }

    return user?.branch_id ?? null
  }

  // =========================
  // GET PRODUCTS
  // =========================

  async function getProduct() {
    const branchId = getBranchId()

    if (!branchId) {
      console.log('Branch ID not found')
      product.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const res = await axios.get('api/product', {
        params: {
          branch_id: branchId
        }
      })

      if (res.data.success) {
        product.value = res.data.data
      } else {
        product.value = []
      }

      return res.data

    } catch (err) {
      console.error('Get products error:', err)
      error.value = err
      product.value = []
    } finally {
      loading.value = false
    }
  }

  // =========================
  // GET PRODUCT BY ID
  // =========================

  async function getProductById(id) {
    try {
      const res = await axios.get(`api/product/${id}`)

      return res.data

    } catch (err) {
      console.error('Get product error:', err)
      throw err
    }
  }

  // =========================
  // CREATE PRODUCT
  // =========================

  async function createProduct(data) {
    const branchId = getBranchId()

    if (!branchId) {
      throw new Error('Branch ID not found')
    }

    const productData = {
      ...data,
      branch_id: branchId
    }

    try {
      const res = await axios.post(
        'api/product',
        productData
      )

      if (res.data.success) {
        await getProduct()
      }

      return res.data

    } catch (err) {
      console.error('Create product error:', err)
      throw err
    }
  }

  // =========================
  // UPDATE PRODUCT
  // =========================

  async function updateProduct(id, data) {
    try {
      const res = await axios.put(
        `api/product/${id}`,
        data
      )

      if (res.data.success) {
        await getProduct()
      }

      return res.data

    } catch (err) {
      console.error('Update product error:', err)
      throw err
    }
  }

  // =========================
  // DELETE PRODUCT
  // =========================

  async function deleteProduct(id) {
    try {
      const res = await axios.delete(
        `api/product/${id}`
      )

      if (res.data.success) {
        await getProduct()
      }

      return res.data

    } catch (err) {
      console.error('Delete product error:', err)
      throw err
    }
  }

  // =========================
  // IMPORT CSV
  // =========================

  async function importProduct(file) {

    if (!file) {
      throw new Error('CSV file is required')
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      throw new Error('Only CSV files are allowed')
    }

    const branchId = getBranchId()

    if (!branchId) {
      throw new Error('Branch ID not found')
    }

    const formData = new FormData()

    formData.append('file', file)

    // Optional:
    // Send branch_id to backend too
    formData.append('branch_id', branchId)

    importing.value = true

    try {
      const res = await axios.post(
        'api/product/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (res.data.success) {
        await getProduct()
      }

      return res.data

    } catch (err) {
      console.error('Import product error:', err)
      throw err
    } finally {
      importing.value = false
    }
  }

  // =========================
  // EXPORT CSV
  // =========================

  async function exportProduct() {
    const branchId = getBranchId()

    if (!branchId) {
      throw new Error('Branch ID not found')
    }

    exporting.value = true

    try {
      const res = await axios.get(
        'api/product/export',
        {
          params: {
            branch_id: branchId
          },
          responseType: 'blob'
        }
      )

      const blob = new Blob(
        [res.data],
        {
          type: 'text/csv;charset=utf-8;'
        }
      )

      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')

      link.href = url

      link.download = `product_branch_${branchId}.csv`

      document.body.appendChild(link)

      link.click()

      link.remove()

      window.URL.revokeObjectURL(url)

    } catch (err) {
      console.error('Export product error:', err)
      throw err
    } finally {
      exporting.value = false
    }
  }

  // =========================
  // DOWNLOAD TEMPLATE
  // =========================

  async function downloadProductTemplate() {

    downloadingTemplate.value = true

    try {
      const res = await axios.get(
        'api/product/template',
        {
          responseType: 'blob'
        }
      )

      const blob = new Blob(
        [res.data],
        {
          type: 'text/csv;charset=utf-8;'
        }
      )

      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')

      link.href = url

      link.download = 'product_template.csv'

      document.body.appendChild(link)

      link.click()

      link.remove()

      window.URL.revokeObjectURL(url)

    } catch (err) {
      console.error(
        'Download product template error:',
        err
      )

      throw err

    } finally {
      downloadingTemplate.value = false
    }
  }

  // =========================
  // CLEAR
  // =========================

  function clearProduct() {
    product.value = []
  }

  // =========================
  // RETURN
  // =========================

  return {
    product,

    loading,
    importing,
    exporting,
    downloadingTemplate,

    error,

    getUser,
    getBranchId,

    getProduct,
    getProductById,

    createProduct,
    updateProduct,
    deleteProduct,

    importProduct,
    exportProduct,
    downloadProductTemplate,

    clearProduct
  }
} 
