import {ref} from 'vue'
const userRole = ref('')
export function useAuth(){

    const checkLogin = () => {
        const role = userRole.value || localStorage.getItem('userRole')
        if (!role) {
            router.push('/login')
            return false
        }
        return true
    }
    return{
        checkLogin
    }
}

export default useAuth