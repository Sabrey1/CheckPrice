 
<template>
  <div class="login-container">
    <Card class="login-card">
      <template #title>
        <h2 class="text-center m-0">Sign In</h2>
      </template>

      <template #content>
        <div class="field">
          <label>Email</label>
          <InputText
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="w-full"
          />
        </div>

        <div class="field mt-3">
          <label>Password</label>
          <Password
            v-model="password"
            placeholder="Enter your password"
            toggleMask
            class="w-full"
            inputClass="w-full"
            :feedback="false"
          />
        </div>

        <Button
          label="Sign In"
          icon="pi pi-sign-in"
          class="w-full mt-4"
          :loading="loading"
          @click="signIn"
        />

        <p v-if="errorMsg" class="error-text">
          {{ errorMsg }}
        </p>
      </template>
    </Card>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const router = useRouter()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

const signIn = async () => {
  loading.value = true
  errorMsg.value = ''

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  loading.value = false

  if (error) {
    errorMsg.value = error.message
    return
  }

  const user = data.user
  if (!user) {
    errorMsg.value = 'User not found'
    return
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  
  if (profileError || !profile) {
    errorMsg.value = 'Profile not found. Contact admin.'
    return
  }
    router.push('/')
   
}
</script>




<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef2ff, #f8fafc);
}

.login-card {
  width: 360px;
  padding: 1rem;
}

.field label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}

.error-text {
  color: #ef4444;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
}
 
</style>
