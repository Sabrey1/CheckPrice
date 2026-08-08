import { ref } from 'vue'
import axios from '../../services/axios.js'
const role = ref([])

export function useRole(){
   async function getRole(){
        const res = await axios.get('api/role')
        if(res.data.success){
            role.value = res.data.data
        }
    }
    return {
        role,
        getRole
    }
}