import { ref } from 'vue'
import axios from '../../services/axios.js'
const product = ref([])

export function useProduct(){
   async function getProduct(){
        const res = await axios.get('api/product')
        if(res.data.success){
            product.value = res.data.data
        }
    }
    return {
        product,
        getProduct
    }
}