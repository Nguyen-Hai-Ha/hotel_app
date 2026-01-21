<template>
  <div class="admin-layout">
    <!-- Auto Update Notification -->
    <UpdateNotification />
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <h2>Hotel Admin</h2>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li v-if="isAdmin">
            <router-link to="/admin/dashboard" active-class="active">
              <FontAwesomeIcon :icon="['fas', 'tachometer-alt']" />
              Dashboard
            </router-link>
          </li>
          <li v-if="isAdmin">
            <router-link to="/admin/room-types" active-class="active">
              <FontAwesomeIcon :icon="['fas', 'list']" />
              Thể loại phòng
            </router-link>
          </li>
          <li v-if="isAdmin">
            <router-link to="/admin/rooms" active-class="active">
              <FontAwesomeIcon :icon="['fas', 'bed']" />
              Quản lý phòng
            </router-link>
          </li>
          <li>
            <router-link to="/admin/bookings" active-class="active">
              <FontAwesomeIcon :icon="['fas', 'calendar-check']" />
              Đặt phòng
            </router-link>
          </li>
          <li>
            <router-link to="/admin/customers" active-class="active">
              <FontAwesomeIcon :icon="['fas', 'user-check']" />
              Quản lý khách hàng
            </router-link>
          </li>
          <li v-if="isAdmin">
            <router-link to="/admin/users" active-class="active">
              <FontAwesomeIcon :icon="['fas', 'users']" />
              Người dùng
            </router-link>
          </li>
          <li v-if="isAdmin">
            <router-link to="/admin/taxes" active-class="active">
              <FontAwesomeIcon :icon="['fas', 'receipt']" />
              Quản lý thuế
            </router-link>
          </li>
          <li v-if="isAdmin">
            <router-link to="/admin/promotions" active-class="active">
              <FontAwesomeIcon :icon="['fas', 'tag']" />
              Quản lý mã giảm giá
            </router-link>
          </li>
          <li v-if="isAdmin">
            <router-link to="/admin/services" active-class="active">
              <FontAwesomeIcon :icon="['fas', 'concierge-bell']" />
              Quản lý dịch vụ
            </router-link>
          </li>
          <li v-if="isAdmin">
            <router-link to="/admin/foods" active-class="active">
              <FontAwesomeIcon :icon="['fas', 'utensils']" />
              Quản lý thức ăn
            </router-link>
          </li>
          <li v-if="isAdmin">
            <router-link to="/admin/excel" active-class="active">
              <FontAwesomeIcon :icon="['fas', 'file-excel']" />
              Quản lý Excel
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">
      <header class="admin-header">
        <div class="header-left">
          <div class="breadcrumb">
            <span class="breadcrumb-item">Admin</span>
            <FontAwesomeIcon :icon="['fas', 'chevron-right']" />
            <span class="breadcrumb-item active">{{ getPageTitle() }}</span>
          </div>
          <h1>{{ getPageTitle() }}</h1>
        </div>

        <div class="header-right">
          <div class="header-actions">
            <!-- Refresh Button -->
            <button class="refresh-btn" @click="refreshPage" title="Tải lại trang">
              <FontAwesomeIcon :icon="['fas', 'sync-alt']" />
            </button>

            <div class="user-menu" @click.stop="toggleUserMenu" v-if="isAdmin">
              <div class="user-avatar">
                <FontAwesomeIcon :icon="['fas', 'user']" />
              </div>
              <div class="user-info">
                <span class="user-name">Admin</span>
                <span class="user-role">Quản trị viên</span>
              </div>
              <FontAwesomeIcon :icon="['fas', 'chevron-down']" :class="{ 'rotated': showUserMenu }" />

              <div class="user-dropdown" :class="{ 'show': showUserMenu }" @click.stop>
                <div class="dropdown-item logout-item" @click="logout">
                  <FontAwesomeIcon :icon="['fas', 'sign-out-alt']" />
                  <span>Đăng xuất</span>
                </div>
              </div>
            </div>
            <div class="dropdown-item logout-item" @click="logout" v-else>
              <FontAwesomeIcon :icon="['fas', 'sign-out-alt']" />
              <span>Đăng xuất</span>
            </div>
          </div>
        </div>
      </header>

      <div class="admin-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import UpdateNotification from '@/components/UpdateNotification.vue'

const router = useRouter()
const route = useRoute()
const showUserMenu = ref(false)

// Load admin data from localStorage
const adminData = JSON.parse(localStorage.getItem('admin_data') || '{}')
const isAdmin = computed(() => adminData.id_role === 1)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const getPageTitle = () => {
  const titles = {
    'AdminDashboard': 'Dashboard',
    'AdminRoomTypes': 'Thể loại phòng',
    'AdminRooms': 'Quản lý phòng',
    'AdminBookings': 'Đặt phòng',
    'AdminCustomers': 'Quản lý khách hàng',
    'AdminUsers': 'Người dùng',
    'AdminTaxes': 'Quản lý thuế',
    'AdminPromotions': 'Quản lý mã giảm giá',
    'AdminServices': 'Quản lý dịch vụ',
    'AdminFoods': 'Quản lý thức ăn'
  }
  return titles[route.name] || 'Admin'
}

const refreshPage = () => {
  window.location.reload()
}

const logout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_data')
  router.push('/login-admin')
}

// Close dropdown when clicking outside
const closeDropdownOnOutsideClick = (event) => {
  // Only close dropdown if clicking outside admin-header area
  const userMenu = document.querySelector('.user-menu')
  if (userMenu && !userMenu.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdownOnOutsideClick)
})

// Cleanup event listener on unmount
onUnmounted(() => {
  document.removeEventListener('click', closeDropdownOnOutsideClick)
})
</script>

<style scoped>
/* Override global CSS that leaks from layout-styles.css */
.admin-layout h2,
.admin-sidebar h2 {
  font-size: 1.5rem !important;
  color: white !important;
  margin: 0 !important;
  margin-bottom: 0 !important;
}

.admin-layout a,
.admin-sidebar a,
.sidebar-nav a {
  text-decoration: none !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

.admin-layout ul,
.admin-sidebar ul {
  list-style: none !important;
  padding: 0 !important;
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
}

.admin-layout li,
.admin-sidebar li {
  margin: 0.5rem 0 !important;
}


/* Admin Layout */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

/* Sidebar */
.admin-sidebar {
  width: 280px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
}

.sidebar-nav ul {
  list-style: none;
  padding: 1rem 0;
  margin: 0;
}

.sidebar-nav li {
  margin: 0.5rem 0;
}

.sidebar-nav a {
  width: 100%;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8) !important;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  text-decoration: none !important;
  border-radius: 0;
}

.sidebar-nav a:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white !important;
  transform: translateX(5px);
}

.sidebar-nav a.active {
  background: rgba(255, 255, 255, 0.2);
  color: white !important;
  border-right: 3px solid #ffd700;
}

.sidebar-nav button {
  width: 100%;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
}

.sidebar-nav button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(5px);
}

.sidebar-nav button.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-right: 3px solid #ffd700;
}

.sidebar-nav i,
.sidebar-nav svg {
  width: 20px;
  text-align: center;
}

/* Main Content */
.admin-main {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
}

/* Header */
.admin-header {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left h1 {
  margin: 0;
  font-size: 1.75rem;
  color: #2d3748;
  font-weight: 600;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #718096;
}

.breadcrumb-item.active {
  color: #4a5568;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: #e9ecef;
  color: #495057;
  border-color: #adb5bd;
}

.refresh-btn:active {
  transform: scale(0.95);
}

.refresh-btn i {
  font-size: 16px;
  font-weight: 900;
  display: inline-block;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: #f7fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.user-menu:hover {
  background: #edf2f7;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.875rem;
}

.user-role {
  font-size: 0.75rem;
  color: #718096;
}

.rotated {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

/* User Dropdown */
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  min-width: 200px;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 8px;
}

.user-dropdown.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 0.25rem;
}

.dropdown-item:hover {
  background: #f7fafc;
  color: #2d3748;
  transform: translateX(4px);
}

.dropdown-item.logout-item {
  color: #e53e3e;
}

.dropdown-item.logout-item:hover {
  background: #fed7d7;
  color: #c53030;
}

.dropdown-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.5rem 0.75rem;
}

.dropdown-item svg {
  width: 16px;
  height: 16px;
  color: inherit;
}

/* Content */
.admin-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .admin-sidebar {
    width: 80px;
  }

  .sidebar-header h2,
  .sidebar-nav a span,
  .user-info {
    display: none;
  }

  .sidebar-nav a {
    justify-content: center;
  }

  .admin-main {
    margin-left: 80px;
  }
}
</style>
