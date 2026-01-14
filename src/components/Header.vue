
<template>
  <header class="header">
    <div class="container">
      <div class="logo">
        <router-link to="/" exact-active-class="active"><img :src="logoSrc" alt="The Secret Hotel Logo" class="header-logo"/></router-link>
      </div>

      <div class="left-section">
        <!-- Navigation -->
        <nav class="navbar" :class="{ 'mobile-open': isMobileMenuOpen }">
          <router-link to="/" exact-active-class="active" @click="closeMobileMenu">{{ $t('nav.home') }}</router-link>
          <router-link to="/rooms" active-class="active" @click="closeMobileMenu">{{ $t('nav.rooms') }}</router-link>
          <router-link to="/contact" active-class="active" @click="closeMobileMenu">{{ $t('nav.contact') }}</router-link>
        </nav>
        
        <!-- Language Switcher -->
        <div class="language-section">
          <LanguageSwitcher />
        </div>
      </div>

      <!-- Mobile Menu Toggle -->
      <button 
        class="mobile-menu-toggle" 
        @click="toggleMobileMenu"
        :class="{ 'active': isMobileMenuOpen }"
        aria-label="Toggle mobile menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <div class="user-actions" v-if="!isAuthenticated">
        <button class="btn btn-outline" @click="$emit('show-signup-modal')">
          <i class="fas fa-user"></i> 
          <span class="btn-text">{{ $t('nav.signup') }}</span>
        </button>
        <button class="btn btn-outline" @click="$emit('show-login-modal')">
          <i class="fas fa-user"></i> 
          <span class="btn-text">{{ $t('nav.login') }}</span>
        </button>
      </div>

      <div class="user-actions" v-else>
        <div class="user-dropdown" v-if="roleUser == 1">
          <div class="user-greeting" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
            <span class="greeting">{{ $t('auth.hi') }}, {{ displayName }}</span>
            <i class="fas fa-chevron-down dropdown-icon"></i>
            
            <div class="dropdown-menu" :class="{ 'show': showDropdown }">
              <router-link to="/admin" active-class="active" class="dropdown-item">
                <i class="fas fa-cog"></i>
                <span>{{ $t('nav.admin') }}</span>
              </router-link>
              <router-link to="/information" active-class="active" class="dropdown-item">
                <i class="fas fa-user"></i>
                <span>{{ $t('nav.information') }}</span>
              </router-link>
              <button class="dropdown-item logout-btn" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                <span>{{ $t('nav.logout') }}</span>
              </button>
            </div>
          </div>
        </div>
        <div class="user-dropdown" v-else>
          <div class="user-greeting" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
            <span class="greeting">{{ $t('auth.hi') }}, {{ displayName }}</span>
            <i class="fas fa-chevron-down dropdown-icon"></i>
            
            <div class="dropdown-menu" :class="{ 'show': showDropdown }">
              <router-link to="/information" active-class="active" class="dropdown-item">
                <i class="fas fa-user"></i>
                <span>{{ $t('nav.information') }}</span>
              </router-link>
              <button class="dropdown-item logout-btn" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                <span>{{ $t('nav.logout') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import LanguageSwitcher from './LanguageSwitcher.vue';
import logoImage from '/images/logo.png';

export default {
  name: 'Header',
  components: {
    LanguageSwitcher
  },
  emits: ['show-login-modal', 'show-signup-modal', 'show-booking-modal'],
  setup() {
    const isMobileMenuOpen = ref(false);
    const user = ref(null);
    const token = ref(null);
    const showDropdown = ref(false);

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
    };

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false;
    };

    const loadAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        token.value = localStorage.getItem('auth_token');
        user.value = storedUser ? JSON.parse(storedUser) : null;
      } catch (e) {
        user.value = null;
        token.value = null;
      }
    };

    const isAuthenticated = computed(() => !!token.value);
    const displayName = computed(() => user.value?.username || 'Guest');
    const roleUser = computed(() => user.value?.id_role || 2);

    const handleLogout = async () => {
      // Optionally call API logout if needed
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      loadAuth();
    };

    onMounted(() => {
      loadAuth();
      window.addEventListener('storage', (e) => {
        if (e.key === 'auth_token' || e.key === 'user') {
          loadAuth();
        }
      });
    });

    return {
      isMobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu,
      isAuthenticated,
      displayName,
      handleLogout,
      roleUser,
      showDropdown,
      logoSrc: logoImage
    };
  }
}
</script>

<style scoped>
.header {
    background-color: var(--vt-c-black);
    padding: 20px 0;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(255, 107, 53, 0.3);
}

.header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo h2 {
    color: var(--booking-blue);
    font-size: 1.8rem;
    margin: 0;
}

.header-logo {
    height: 50px;
    width: auto;
}

.navbar {
    display: flex;
    gap: 30px;
}

.navbar a {
    color: #fff;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
    padding: 8px 12px;
    border-radius: 4px;
}

.navbar a:hover, 
.navbar a.active {
    color: var(--booking-blue);
    background-color: rgba(255, 107, 53, 0.1);
}

.user-actions {
    display: flex;
    gap: 15px;
    align-items: center;
}

.user-actions .btn {
    display: flex;
    align-items: center;
    gap: 8px;
}

.greeting {
    color: #fff;
}

.user-dropdown {
  position: relative;
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
}

.user-greeting:hover {
  background: rgba(255, 107, 53, 0.2);
  border-color: rgba(255, 107, 53, 0.5);
}

.greeting {
  font-weight: 600;
  color: #fff;
}

.dropdown-icon {
  font-size: 1rem;
  color: #ff6b35;
  transition: transform 0.3s ease;
}

.user-greeting:hover .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #2a2a2a;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid #3a3a3a;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  min-width: 180px;
  z-index: 1000;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
  color: #e5e7eb;
  font-weight: 500;
  font-size: 0.95rem;
  border: none;
  background: none;
  width: 100%;
  cursor: pointer;
  margin-bottom: 4px;
}

.dropdown-item:last-child {
  margin-bottom: 0;
}

.dropdown-item:hover {
  background: rgba(255, 107, 53, 0.15);
  color: #fff;
  transform: translateX(4px);
}

.dropdown-item i {
  font-size: 1.1rem;
  color: #ff6b35;
  width: 16px;
  text-align: center;
}

.dropdown-item span {
  flex: 1;
}

.logout-btn {
  border-top: 1px solid #3a3a3a;
  margin-top: 4px;
  padding-top: 16px;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #fff;
}

.logout-btn i {
  color: #ef4444;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
    display: none;
    flex-direction: column;
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    gap: 4px;
}

.mobile-menu-toggle span {
    width: 25px;
    height: 3px;
    background-color: var(--booking-blue);
    transition: all 0.3s ease;
    border-radius: 2px;
}

.mobile-menu-toggle.active span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-toggle.active span:nth-child(2) {
    opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
}

.language-section {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

/* Mobile Styles */
@media (max-width: 768px) {
    .header {
        padding: 12px 0;
    }

    .header .container {
        padding: 0 15px;
    }

    .mobile-menu-toggle {
        display: flex;
        margin-left: auto;
        margin-right: 15px;
    }

    .navbar {
        position: fixed;
        top: 74px; /* Header height */
        left: 0;
        right: 0;
        background-color: rgba(18, 18, 18, 0.98);
        flex-direction: column;
        gap: 0;
        padding: 40px 0;
        transform: translateX(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        overflow-y: auto;
        backdrop-filter: blur(10px);
    }

    .navbar.mobile-open {
        transform: translateX(0);
        opacity: 1;
        visibility: visible;
    }

    .navbar a {
        padding: 15px 20px;
        border-radius: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        text-align: center;
        font-size: 1.1rem;
    }

    .navbar a:last-child {
        border-bottom: none;
    }

    .navbar a.active {
        background-color: rgba(255, 107, 53, 0.2);
        border-left: 3px solid #ff6b35;
    }

    .user-actions {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 15px;
        background: rgba(18, 18, 18, 0.95);
        backdrop-filter: blur(10px);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        justify-content: space-around;
        z-index: 1001;
    }

    .user-actions .btn {
        flex: 1;
        max-width: 160px;
        justify-content: center;
        padding: 12px;
    }

    .user-dropdown {
        width: 100%;
    }

    .user-greeting {
        width: 100%;
        justify-content: center;
    }

    .dropdown-menu {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        top: auto;
        border-radius: 12px 12px 0 0;
        transform: translateY(100%);
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
    }

    .dropdown-menu.show {
        transform: translateY(0);
    }

    .dropdown-item {
        padding: 15px 20px;
        font-size: 1rem;
    }

    .language-section {
      position: fixed;
      top: 15px;
      right: 60px;
      z-index: 1002;
    }
}

@media (max-width: 480px) {
    .logo h2 {
        font-size: 1.5rem;
    }

    .header-logo {
        height: 40px;
    }
}

/* Tablet Styles */
@media (min-width: 769px) and (max-width: 1024px) {
    .header .container {
        padding: 0 30px;
    }

    .navbar {
        gap: 20px;
    }

    .navbar a {
        font-size: 0.9rem;
        padding: 6px 10px;
    }

    .user-actions {
        gap: 10px;
    }

    .user-actions .btn {
        padding: 8px 12px;
        font-size: 0.9rem;
    }
}
</style>
