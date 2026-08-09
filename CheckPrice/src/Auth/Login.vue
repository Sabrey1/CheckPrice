 
<template>
  <div class="login-container">
    <Card class="login-card">
      <template #title>
        <h2 class="text-center m-0">Sign In</h2>
      </template>

      <template #content>
        <div class="field">
          <label>Username</label>
          <InputText
            v-model="username"
            type="text"
            placeholder="Enter your username"
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
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

import axios from '../../services/axios.js'
import useAuth from '@/composable/useAuth'
const router = useRouter()
const { setUser } = useAuth()
const username = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

const signIn = async () => {
  errorMsg.value = ''

  if (!username.value.trim() || !password.value) {
    errorMsg.value = 'Username and password are required'
    return
  }

  loading.value = true

  try {
     

    const response = await axios.post('api/login', {
      username: username.value.trim(),
      password: password.value
    })
 
    if (response.data.success) {
      setUser(response.data.data)

      await router.push('/')
    } else {
      errorMsg.value = response.data.message || 'Login failed'
    }
  } catch (error) {
    console.error('Login error:', error)

    errorMsg.value =
      error.response?.data?.message ||
      'Unable to connect to the server'
  } finally {
    loading.value = false
  }
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
