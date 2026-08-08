import { ref } from 'vue'
import { useRouter } from 'vue-router'

const userRole = ref(
  localStorage.getItem('userRole') || ''
)

export function useAuth() {
  const router = useRouter()

  const setUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('userRole', String(user.role_id))
    localStorage.setItem('userId', String(user.id))

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

  const getRole = () => {
    return localStorage.getItem('userRole')
  }

  const isLoggedIn = () => {
    return !!localStorage.getItem('user')
  }

  const checkLogin = () => {
    if (!isLoggedIn()) {
      router.push('/login')
      return false
    }

    return true
  }

  const logout = async () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')

    userRole.value = ''

    await router.push('/login')
  }

  return {
    setUser,
    getUser,
    getRole,
    isLoggedIn,
    checkLogin,
    logout,
  }
}

export default useAuth