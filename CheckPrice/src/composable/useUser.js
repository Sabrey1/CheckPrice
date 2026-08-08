import { ref } from 'vue'
import axios from '../../services/axios.js'
const user = ref([])

export function useUser(){
   async function getUser(){
        const res = await axios.get('api/user')
        if(res.data.success){
            user.value = res.data.data
        }
    }
    return {
        user,
        getUser
    }
}