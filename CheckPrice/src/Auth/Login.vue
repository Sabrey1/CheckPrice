<template>
  <div class="login-container">
    <Card class="login-card">
      <template #title>
        <h2 class="m-0 text-center">Login</h2>
      </template>

      <template #content>
        <Message v-if="errorMsg" severity="error" class="mb-3">
          {{ errorMsg }}
        </Message>

        <div class="field">
          <label>Email</label>
          <InputText v-model="email" class="w-full" />
        </div>

        <div class="field mt-3">
          <label>Password</label>
          <Password
            v-model="password"
            toggleMask
            class="w-full"
            inputClass="w-full"
            :feedback="false"
          />
        </div>

        <Button
          label="Login"
          class="w-full mt-4"
          :loading="loading"
          @click="login"
        />
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
import Message from 'primevue/message'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const login = async () => {
  loading.value = true
  errorMsg.value = ''

  // 1️⃣ LOGIN (auth.users)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value.trim().toLowerCase(),
    password: password.value,
  })

  if (error) {
    errorMsg.value = error.message
    loading.value = false
    return
  }

  // 2️⃣ LOAD USER FROM 01_users
  const { data: user, error: userError } = await supabase
    .from('01_users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  loading.value = false

  if (userError) {
    errorMsg.value = 'User profile not found'
    return
  }

  // ✅ SUCCESS → USE 01_users DATA
  console.log('Logged in user:', user)

  router.push('/dashboard')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f7fa;
}
.login-card {
  width: 350px;
}
</style>
