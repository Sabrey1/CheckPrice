import { ref } from 'vue'
import { useRouter } from 'vue-router'

const userRole = ref(
  localStorage.getItem('userRole') || ''
)

const isExpired = (token)=> {
  try{
    const payload = JSON.parse(atob(token.split('.')[1]))
    return !payload.exp || payload.exp * 1000 <= Date.now()
  }catch(e){
    return true
  }
}

export function useAuth() {
  const router = useRouter()

  const setUser = (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('userRole', String(user.role_id))
    if(token) localStorage.setItem('token', token)
    userRole.value = String(user.role_id)
  }

  const getUser = () => {
    const user = localStorage.getItem('user')

    if (!user) {
      return null
    }

    try {
      return JSON.parse(user)
    } catch {
      return null
    }
  }

  const getToken = () => {
    const token = localStorage.getItem('token')
    return token && !isExpired(token) ? token : null
  }

  const getRole = () => {
    return localStorage.getItem('userRole')
  }

  const isLoggedIn = () => !!getToken()

  const logout = async () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('token')
    userRole.value = ''

    await router.push('/login')
  }

  const checkLogin = () => {
    if (!isLoggedIn()) {
      router.push('/login')
      return false
    }

    return true
  }

  return {
    setUser,
    getUser,
    getRole,
    getToken,
    isLoggedIn,
    checkLogin,
    logout,
  }
}

export default useAuth