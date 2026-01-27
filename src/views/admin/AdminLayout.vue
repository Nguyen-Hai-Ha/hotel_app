<template>
  <div class="admin-layout" :class="{ 'dark-mode': isDarkMode }">
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
            <!-- Theme Toggle Button -->
            <button class="theme-toggle-btn" @click="toggleTheme" :title="isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'">
              <FontAwesomeIcon :icon="['fas', isDarkMode ? 'sun' : 'moon']" />
            </button>

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
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const route = useRoute()
const showUserMenu = ref(false)
const { isDarkMode, toggleTheme } = useTheme()

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
 .admin-sidebar h2 {
  font-size: 1.5rem !important;
  color: white !important;
  margin: 0 !important;
  margin-bottom: 0 !important;
 }
 
 .admin-sidebar a,
 .sidebar-nav a {
  text-decoration: none !important;
  color: rgba(255, 255, 255, 0.8) !important;
 }
 
 .admin-sidebar ul {
  list-style: none !important;
  padding: 0 !important;
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
 }
 
 .admin-sidebar li {
  margin: 0.5rem 0 !important;
 }

/* Admin Layout */
.admin-layout {
  --admin-bg: #f8fafc;
  --admin-surface: #ffffff;
  --admin-text: #2d3748;
  --admin-muted: #718096;
  --admin-border: #e2e8f0;
  --admin-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --admin-control-bg: #f8f9fa;
  --admin-control-border: #dee2e6;
  --admin-control-text: #6c757d;
  --admin-control-bg-hover: #e9ecef;
  --admin-control-border-hover: #adb5bd;
  --admin-control-text-hover: #495057;
  display: flex;
  min-height: 100vh;
  background-color: var(--admin-bg);
}

.admin-layout.dark-mode {
  --admin-bg: #0b1220;
  --admin-surface: #0f172a;
  --admin-text: #e2e8f0;
  --admin-muted: #94a3b8;
  --admin-border: rgba(148, 163, 184, 0.2);
  --admin-shadow: 0 1px 3px rgba(0, 0, 0, 0.55);
  --admin-control-bg: rgba(148, 163, 184, 0.12);
  --admin-control-border: rgba(148, 163, 184, 0.25);
  --admin-control-text: #e2e8f0;
  --admin-control-bg-hover: rgba(148, 163, 184, 0.18);
  --admin-control-border-hover: rgba(148, 163, 184, 0.32);
  --admin-control-text-hover: #ffffff;
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

.admin-layout.dark-mode .admin-sidebar {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-nav {
  padding: 0.5rem 0;
}

.sidebar-nav ul {
  padding: 0.75rem 0.75rem 1rem !important;
  margin: 0;
}

.sidebar-nav li {
  margin: 0 !important;
}

.sidebar-nav a {
  width: 100%;
  padding: 0.75rem 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9) !important;
  transition: background-color 0.2s ease, transform 0.2s ease, color 0.2s ease;
}

.sidebar-nav a svg {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
}

.sidebar-nav a:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff !important;
}

.sidebar-nav a:active {
  transform: translateX(2px);
}

.sidebar-nav a.active {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff !important;
  box-shadow: inset 3px 0 0 rgba(255, 215, 0, 0.9);
}

.sidebar-nav a:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.45);
  outline-offset: 2px;
}

.admin-layout.dark-mode .sidebar-nav a:hover {
  background: rgba(148, 163, 184, 0.14);
}

.admin-layout.dark-mode .sidebar-nav a.active {
  background: rgba(148, 163, 184, 0.18);
  box-shadow: inset 3px 0 0 rgba(250, 204, 21, 0.85);
}

.admin-main {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  background-color: var(--admin-bg);
}

/* Header */
.admin-header {
  background: var(--admin-surface);
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--admin-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--admin-shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left h1 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--admin-text);
  font-weight: 600;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--admin-muted);
}

.breadcrumb-item.active {
  color: var(--admin-text);
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

.theme-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--admin-control-bg);
  border: 1px solid var(--admin-control-border);
  border-radius: 8px;
  color: var(--admin-control-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle-btn:hover {
  background: var(--admin-control-bg-hover);
  color: var(--admin-control-text-hover);
  border-color: var(--admin-control-border-hover);
}

.theme-toggle-btn:active {
  transform: scale(0.95);
}

.admin-layout.dark-mode .theme-toggle-btn {
  background: rgba(250, 204, 21, 0.12);
  border-color: rgba(250, 204, 21, 0.35);
  color: #facc15;
}

.admin-layout.dark-mode .theme-toggle-btn:hover {
  background: rgba(250, 204, 21, 0.16);
  border-color: rgba(250, 204, 21, 0.45);
  color: #fde047;
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--admin-control-bg);
  border: 1px solid var(--admin-control-border);
  border-radius: 8px;
  color: var(--admin-control-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: var(--admin-control-bg-hover);
  color: var(--admin-control-text-hover);
  border-color: var(--admin-control-border-hover);
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
  background: var(--admin-control-bg);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.user-menu:hover {
  background: var(--admin-control-bg-hover);
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
  color: var(--admin-text);
  font-size: 0.875rem;
}

.user-role {
  font-size: 0.75rem;
  color: var(--admin-muted);
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
  background: var(--admin-surface);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--admin-border);
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
  color: var(--admin-text);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 0.25rem;
}

.dropdown-item:hover {
  background: rgba(148, 163, 184, 0.12);
  color: var(--admin-text);
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
  background: var(--admin-border);
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
  background-color: var(--admin-bg);
}

.admin-layout.dark-mode :deep(.table-container) {
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  box-shadow: var(--admin-shadow);
}

.admin-layout.dark-mode :deep(table) {
  background: transparent;
  color: var(--admin-text);
}

.admin-layout.dark-mode :deep(thead) {
  background: rgba(148, 163, 184, 0.12);
}

.admin-layout.dark-mode :deep(th) {
  color: var(--admin-muted);
  border-bottom: 1px solid var(--admin-border);
}

.admin-layout.dark-mode :deep(td) {
  color: var(--admin-text);
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.admin-layout.dark-mode :deep(tbody tr:hover) {
  background: rgba(148, 163, 184, 0.10);
}

.admin-layout.dark-mode :deep(.stat-card) {
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  box-shadow: var(--admin-shadow);
}

.admin-layout.dark-mode :deep(.stat-info h3) {
  color: var(--admin-text);
}

.admin-layout.dark-mode :deep(.stat-info p) {
  color: var(--admin-muted);
}

.admin-layout.dark-mode :deep(.section-header h2) {
  color: var(--admin-text);
}

.admin-layout.dark-mode :deep(.search-input) {
  background: rgba(148, 163, 184, 0.10) !important;
  color: var(--admin-text) !important;
  border-color: rgba(148, 163, 184, 0.25) !important;
}

.admin-layout.dark-mode :deep(.search-input::placeholder) {
  color: rgba(148, 163, 184, 0.85) !important;
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
