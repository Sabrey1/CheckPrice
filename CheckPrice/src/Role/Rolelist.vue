<template>
    <div class="w-full">
        <DataTable :value="role" stripedRows :loading="loading" >
            <Column header="ល.រ">
                <template #body="slotProps">
                    {{ slotProps.index + 1 }}
                </template>
            </Column>
            <Column field="name" header="ឈ្មោះ" /> 
             
            <Column  >
                <template #body="slotProps">
                    <div class="flex gap-2 items-center justify-content-end">
                        <RoleView :role="slotProps.data" />
                        <Button
                            icon="pi pi-pencil"
                            label="កែប្រែ"
                            class="p-button-primary"
                            :disabled="userRole !== 'admin'"
                            @click="checkLoginAndEdit(slotProps.data)"
                        />
                        <Button
                            icon="pi pi-trash"
                            label="លុប"
                            class="p-button-danger"
                            :disabled="userRole !== 'admin'"
                            @click="checkLoginAndDelete(slotProps.data)"
                        />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, onMounted,onBeforeUnmount } from 'vue';
import { useDevice } from '@/hook/useDevice.js'
import { useRole } from '@/composable/useRole.js'

const { getRole,role } = useRole()

const { isMobile } = useDevice()

onMounted(() => {
    window.addEventListener('resize', isMobile)
    getRole()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', isMobile)
})


</script>