<template>
    <div class="users-management">
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td>{{ user.id }}</td>
                        <td>{{ user.username }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.status }}</td>
                        <td>{{ formatDate(user.created_at) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const users = ref([])

const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('vi-VN')
}

const fetchUsers = async () => {
    try {
        const response = await axios.get('https://api.thesecret-hotel.com/api/admin/users')
        users.value = response.data
    } catch (error) {
        console.error('Error fetching users:', error)
    }
}

onMounted(() => {
    fetchUsers()
})
</script>

<style scoped>
@import '@/assets/admin-global.css';
</style>
