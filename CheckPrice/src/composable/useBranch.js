import { ref } from 'vue'
import axios from '../../services/axios.js'
const branch = ref([])

export function useBranch(){
   async function getBranch(){
        const res = await axios.get('/branch')
        if(res.data.success){
            branch.value = res.data.data
        }
    }
    return {
        branch,
        getBranch
    }
}