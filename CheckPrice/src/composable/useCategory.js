import {ref} from 'vue'

const categories = ref([])
const loading = ref(false)
const userRole = ref('')
import { supabase } from '@/supabase'
export function useCategory(){

   async function getCategory(){
        loading.value = true
  const { data: categoryData, error: categoryError } = await supabase
    .from('Category')
    .select('*')
    .order('created_at', { ascending: false })

  if (!categoryError) categories.value = categoryData
  else console.error(categoryError)
  loading.value = false

  // Get current session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session || !session.user) return

  // Get role from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profileError || !profile?.role) userRole.value = 'user'
  else userRole.value = profile.role

  localStorage.setItem('userRole', userRole.value)
    }

    return{
        categories,
        getCategory
    }
}

export default useCategory