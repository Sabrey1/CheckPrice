<template>
    <div class="w-full"> 
        <DataTable :value="user" tableStyle="min-width: 50rem">
            <Column header="ល.រ">
                <template #body="slotProps">
                    {{ slotProps.index + 1 }}
                </template>
            </Column>
            <Column field="username" header="ឈ្មោះ" /> 
            <Column field="phone" header="លេខទូរស័ព្ទ" /> 
            <Column field="email" header="អ៊ីមែល" /> 
            <Column field="created_at" header="ថ្ងៃបង្កើត" /> 
            <Column header="Action" >
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
import { ref, onMounted } from 'vue';
import { useUser } from '@/composable/useUser.js'

const { getUser,user } = useUser()

onMounted(() => {
    getUser()
})
</script>