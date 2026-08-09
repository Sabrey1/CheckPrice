import { ref } from 'vue'
import axios from '../../services/axios.js'
const product = ref([])

export function useProduct(){
    async function getProduct() {
    const userString = localStorage.getItem('user')

    if (!userString) {
      console.log('User not found')
      return
    }

    const user = JSON.parse(userString)

    const branchId = user?.branch_id
 
    const res = await axios.get('api/product', {
      params: {
        branch_id: branchId,
      },
    })

    if (res.data.success) {
      product.value = res.data.data
    }
  }
    return {
        product,
        getProduct
    }
}