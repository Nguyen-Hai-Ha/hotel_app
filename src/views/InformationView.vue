<template>
  <div class="information-page">
    <div class="container">
      <!-- User Profile Section -->
      <div class="profile-section">
        <div class="profile-header">
          <div class="profile-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="profile-info">
            <h2>{{ userInfo.username || 'Người dùng' }}</h2>
            <p class="email">{{ userInfo.email || 'email@example.com' }}</p>
            <p class="phone">{{ userInfo.phone || 'Chưa cập nhật' }}</p>
          </div>
          <button class="btn btn-outline edit-profile-btn" @click="showEditModal = true">
            <i class="fas fa-edit"></i>
            Chỉnh sửa thông tin
          </button>
        </div>
      </div>

      <!-- Booking History Section -->
      <div class="booking-section">
        <div class="section-header">
          <h3>Lịch sử đặt phòng</h3>
          <div class="filter-tabs">
            <button class="tab-btn" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
              Tất cả
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'deposited' }" @click="activeTab = 'deposited'">
              Đã đặt cọc
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'success' }" @click="activeTab = 'success'">
              Đã thanh toán
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'cancelled' }" @click="activeTab = 'cancelled'">
              Đã hủy
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredBookings.length === 0" class="empty-state">
          <i class="fas fa-calendar-times"></i>
          <h4>Chưa có đặt phòng nào</h4>
          <p>Bạn chưa có lịch sử đặt phòng. Hãy đặt phòng đầu tiên của bạn!</p>
          <router-link to="/rooms" class="btn btn-primary">
            <i class="fas fa-bed"></i>
            Xem phòng có sẵn
          </router-link>
        </div>

        <!-- Booking Cards -->
        <div v-else class="booking-grid">
          <div v-for="booking in filteredBookings" :key="booking.id" class="booking-card">
            <div class="booking-header">
              <div class="booking-id">
                <span class="label">Mã đặt phòng:</span>
                <span class="value">#{{ booking.id }}</span>
              </div>
              <div class="booking-status" :class="getStatusClass(booking.status)">
                {{ getStatusText(booking.status) }}
              </div>
            </div>

            <div class="booking-details">
              <div class="room-info">
                <div class="room-image">
                  <img :src="`${apiUrl}/hotelBE/public/` + (booking.room_image || 'images/hotel1.jpg')"
                    :alt="'Phòng ' + booking.room_number">
                </div>
                <div class="room-details">
                  <h4>Phòng {{ booking.room_number }}</h4>
                  <p class="room-type">{{ booking.room_type || 'Standard Room' }}</p>
                </div>
              </div>

              <div class="date-info">
                <div class="date-item">
                  <i class="fas fa-calendar-check"></i>
                  <div>
                    <span class="label">Nhận phòng</span>
                    <span class="value">{{ formatDate(booking.check_in) }}</span>
                  </div>
                </div>
                <div class="date-item">
                  <i class="fas fa-calendar-times"></i>
                  <div>
                    <span class="label">Trả phòng</span>
                    <span class="value">{{ formatDate(booking.check_out) }}</span>
                  </div>
                </div>
              </div>

              <div class="price-info">
                <div class="price-item">
                  <span class="label">Tổng tiền:</span>
                  <span class="value price">{{ formatCurrency(booking.grand_total) }}</span>
                </div>
                <div class="price-item" v-if="booking.status === 'deposited'">
                  <span class="label">Còn lại:</span>
                  <span class="value remaining">{{ formatCurrency(booking.grand_total * 0.7) }}</span>
                </div>
              </div>
            </div>

            <!-- <div class="booking-actions">
              <button class="btn btn-outline" @click="viewBookingDetails(booking)">
                <i class="fas fa-eye"></i>
                Xem chi tiết
              </button>
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Chỉnh sửa thông tin cá nhân</h3>
          <button class="close-btn" @click="showEditModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="updateProfile" class="edit-form">
          <div class="form-group">
            <label for="name">Họ và tên</label>
            <input type="text" id="name" v-model="editForm.username" placeholder="Nhập họ và tên" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="editForm.email" placeholder="Nhập email" required>
          </div>
          <div class="form-group">
            <label for="phone">Số điện thoại</label>
            <input type="tel" id="phone" v-model="editForm.phone" placeholder="Nhập số điện thoại">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="showEditModal = false">
              Hủy
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i>
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { apiUrl } from '@/environment'

export default {
  name: 'InformationView',
  setup() {
    // State
    const userInfo = ref({
      name: '',
      email: '',
      phone: ''
    })
    const bookings = ref([])
    const loading = ref(false)
    const activeTab = ref('all')
    const showEditModal = ref(false)
    const editForm = ref({
      name: '',
      email: '',
      phone: ''
    })

    // Computed
    const filteredBookings = computed(() => {
      if (activeTab.value === 'all') {
        return bookings.value
      }
      return bookings.value.filter(booking => booking.status === activeTab.value)
    })

    // Methods
    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    }

    const getStatusClass = (status) => {
      const classes = {
        'deposited': 'status-deposited',
        'success': 'status-success',
        'cancelled': 'status-cancelled',
        'comfirmed': 'status-comfirmed',
        'done': 'status-done'
      }
      return classes[status] || 'status-default'
    }

    const getStatusText = (status) => {
      const texts = {
        'deposited': 'Đã đặt cọc',
        'success': 'Đã thanh toán',
        'cancelled': 'Đã hủy',
        'comfirmed': 'Đã xác nhận',
        'done': 'Đã hoàn thành'
      }
      return texts[status] || status
    }

    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) return

        const response = await axios.get(`${apiUrl}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        userInfo.value = response.data
        editForm.value = { ...response.data }
      } catch (error) {
        console.error('Error fetching user info:', error)
      }
    }

    const fetchBookings = async () => {
      try {
        loading.value = true
        const token = localStorage.getItem('auth_token')
        if (!token) return

        const response = await axios.get(`${apiUrl}/api/user/bookings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        bookings.value = response.data
      } catch (error) {
        console.error('Error fetching bookings:', error)
        bookings.value = []
      } finally {
        loading.value = false
      }
    }

    const updateProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) return

        const response = await axios.put(`${apiUrl}/api/user/profile`, editForm.value, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        userInfo.value = response.data
        showEditModal.value = false
        alert('Cập nhật thông tin thành công!')
      } catch (error) {
        console.error('Error updating profile:', error)
        alert('Có lỗi xảy ra khi cập nhật thông tin!')
      }
    }

    const viewBookingDetails = (booking) => {
      // Navigate to booking detail page or show modal
      console.log('View booking details:', booking)
    }

    const payRemaining = (booking) => {
      // Navigate to payment page for remaining amount
      console.log('Pay remaining amount:', booking)
    }

    const cancelBooking = async (booking) => {
      if (!confirm('Bạn có chắc chắn muốn hủy đặt phòng này?')) return

      try {
        const token = localStorage.getItem('auth_token')
        await axios.put(`${apiUrl}/api/bookings/${booking.id}/cancel`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        // Update booking status in local state
        const index = bookings.value.findIndex(b => b.id === booking.id)
        if (index !== -1) {
          bookings.value[index].status = 'cancelled'
        }

        alert('Hủy đặt phòng thành công!')
      } catch (error) {
        console.error('Error cancelling booking:', error)
        alert('Có lỗi xảy ra khi hủy đặt phòng!')
      }
    }

    // Lifecycle
    onMounted(() => {
      fetchUserInfo()
      fetchBookings()
    })

    return {
      userInfo,
      bookings,
      loading,
      activeTab,
      showEditModal,
      editForm,
      filteredBookings,
      formatDate,
      formatCurrency,
      getStatusClass,
      getStatusText,
      updateProfile,
      viewBookingDetails,
      payRemaining,
      cancelBooking,
      apiUrl
    }
  }
}
</script>

<style scoped>
.information-page {
  min-height: 100vh;
  background-color: #1f1f1f;
  color: #f3f4f6;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Profile Section */
.profile-section {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #3a3a3a;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.profile-avatar {
  font-size: 4rem;
  color: #ff6b35;
}

.profile-info h2 {
  margin: 0 0 0.5rem 0;
  color: #ffffff;
  font-size: 1.8rem;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .profile-avatar {
    font-size: 3rem;
  }

  .profile-info h2 {
    font-size: 1.5rem;
  }

  .edit-profile-btn {
    margin: 1rem auto 0;
    width: 100%;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-tabs {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .tab-btn {
    white-space: nowrap;
    font-size: 0.9rem;
  }

  .booking-card {
    padding: 1rem;
  }
}

@media (max-width: 480px) {

  .profile-section,
  .booking-section {
    padding: 1rem;
  }

  .profile-avatar {
    font-size: 2.5rem;
  }

  .profile-info h2 {
    font-size: 1.3rem;
  }

  .section-header h3 {
    font-size: 1.3rem;
  }

  .tab-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}

.profile-info .email,
.profile-info .phone {
  margin: 0.25rem 0;
  color: #cbd5e1;
}

.edit-profile-btn {
  margin-left: auto;
}

/* Booking Section */
.booking-section {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #3a3a3a;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h3 {
  color: #ffffff;
  margin: 0;
  font-size: 1.5rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #3a3a3a;
  background: transparent;
  color: #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active,
.tab-btn:hover {
  background: #ff6b35;
  color: white;
  border-color: #ff6b35;
}

/* Loading and Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.loading-state i {
  font-size: 2rem;
  color: #ff6b35;
  margin-bottom: 1rem;
}

.empty-state i {
  font-size: 3rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.empty-state h4 {
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #cbd5e1;
  margin-bottom: 2rem;
}

/* Booking Grid */
.booking-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.booking-card {
  background: #1f1f1f;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.booking-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.booking-id .label {
  color: #9ca3af;
  font-size: 0.9rem;
}

.booking-id .value {
  color: #ffffff;
  font-weight: 600;
  margin-left: 0.5rem;
}

.booking-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-deposited {
  background: #fef3c7;
  color: #92400e;
}

.status-success {
  background: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

/* Room Info */
.room-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.room-image {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
}

.room-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-details h4 {
  color: #ffffff;
  margin: 0 0 0.25rem 0;
}

.room-type {
  color: #9ca3af;
  margin: 0;
  font-size: 0.9rem;
}

/* Date Info */
.date-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.date-item i {
  color: #ff6b35;
  font-size: 1.1rem;
}

.date-item .label {
  color: #9ca3af;
  font-size: 0.85rem;
  display: block;
}

.date-item .value {
  color: #ffffff;
  font-weight: 500;
  display: block;
}

/* Price Info */
.price-info {
  margin-bottom: 1.5rem;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.price-item .label {
  color: #9ca3af;
}

.price-item .value.price {
  color: #10b981;
  font-weight: 600;
}

.price-item .value.remaining {
  color: #f59e0b;
  font-weight: 600;
}

/* Booking Actions */
.booking-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.booking-actions .btn {
  flex: 1;
  min-width: 120px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
}

.btn-primary {
  background: #ff6b35;
  color: white;
}

.btn-primary:hover {
  background: #e55a2b;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  border: 1px solid #3a3a3a;
  color: #cbd5e1;
}

.btn-outline:hover {
  background: #3a3a3a;
  color: white;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #2a2a2a;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #3a3a3a;
}

.modal-header h3 {
  color: #ffffff;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
}

.close-btn:hover {
  color: #ffffff;
}

.edit-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #e5e7eb;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  background: #1f1f1f;
  color: #f3f4f6;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .booking-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .edit-profile-btn {
    margin-left: 0;
    width: 100%;
    max-width: 300px;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .booking-grid {
    grid-template-columns: 1fr;
  }

  .booking-actions {
    flex-direction: column;
  }

  .booking-actions .btn {
    flex: none;
  }

  .date-info {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .date-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 0.75rem;
    border-radius: 8px;
  }

  .room-info {
    flex-direction: column;
    text-align: center;
  }

  .room-image {
    width: 100%;
    height: 150px;
    margin-bottom: 0.5rem;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}

@media (max-width: 480px) {
  .information-page {
    padding: 1rem 0;
  }

  .profile-section,
  .booking-section {
    border-radius: 8px;
  }

  .profile-avatar {
    font-size: 3rem;
  }

  .booking-header {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }

  .booking-status {
    width: 100%;
    text-align: center;
  }

  .price-info {
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
  }

  .price-item {
    font-size: 0.9rem;
  }

  .filter-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .tab-btn {
    width: 100%;
    padding: 0.5rem;
    font-size: 0.85rem;
  }

  .form-group input {
    font-size: 0.9rem;
    padding: 0.6rem;
  }
}
</style>
