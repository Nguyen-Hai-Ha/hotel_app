<template>
    <div class="dashboard">
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">
                    <FontAwesomeIcon :icon="['fas', 'bed']" />
                </div>
                <div class="stat-info">
                    <h3>{{ stats.totalRooms }}</h3>
                    <p>Tổng số phòng</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <FontAwesomeIcon :icon="['fas', 'calendar-check']" />
                </div>
                <div class="stat-info">
                    <h3>{{ stats.totalBookings }}</h3>
                    <p>Đặt phòng hôm nay</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <FontAwesomeIcon :icon="['fas', 'users']" />
                </div>
                <div class="stat-info">
                    <h3>{{ stats.totalUsers }}</h3>
                    <p>Người dùng</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <FontAwesomeIcon :icon="['fas', 'dollar-sign']" />
                </div>
                <div class="stat-info">
                    <h3>{{ formatCurrency(stats.totalRevenue) }}</h3>
                    <p>Doanh thu tháng</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import axios from 'axios'

const stats = ref({
    totalRooms: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0
})

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount)
}

const fetchStats = async () => {
    try {
        const response = await axios.get('https://api.thesecret-hotel.com/api/admin/stats')
        stats.value = response.data
    } catch (error) {
        console.error('Error fetching stats:', error)
    }
}

onMounted(() => {
    fetchStats()
})
</script>

<style scoped>
@import '@/assets/admin-global.css';
</style>
