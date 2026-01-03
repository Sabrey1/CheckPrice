<template>
  <div class="login-container">
    <Card class="login-card">
      <template #title>
        <div>
            <h2 class="m-0 text-center">Login</h2>
        </div>
        
      </template>

      <template #content>
        <div class="field">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter email"
            class="w-full"
          />
        </div>

        <div class="field mt-3">
  <label for="password">Password</label>

  <Password
    id="password"
    v-model="password"
    placeholder="Enter password"
    toggleMask
    class="w-full"
    inputClass="w-full"
  />
</div>


        <Button
          label="Login"
          icon="pi pi-sign-in"
          class="w-full mt-4"
          @click="login"
        />
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const email = ref('')
const password = ref('')

const login = () => {
  if (!email.value || !password.value) {
    alert('Please enter email and password')
    return
  }

  console.log('Email:', email.value)
  console.log('Password:', password.value)

  // 👉 later you can connect Supabase login here
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

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
</style>
