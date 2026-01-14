<template>
  <div id="app" class="app-container">
    <!-- Show header and footer only for non-admin pages -->
    <template v-if="!isAdminPage">
      <Header 
        @show-login-modal="showLogin = true" 
        @show-signup-modal="showSignup = true"
        @show-booking-modal="showBookingModal = true" 
      />
      
      <main class="main-content">
        <router-view @show-quick-booking-modal-with-room="openQuickBookingModalWithRoom" />
      </main>

      <Footer />
    </template>

    <!-- For admin pages, render without header/footer -->
    <template v-else>
      <router-view @show-quick-booking-modal-with-room="openQuickBookingModalWithRoom" />
    </template>

    <!-- Login Modal -->
    <LoginModal 
      :isVisible="showLogin" 
      @close="showLogin = false"
      @show-signup="showSignup = true; showLogin = false"
      @show-forgot-password="showForgotPassword = true; showLogin = false"
    />

    <!-- Sign Up Modal -->
    <SignUpModal 
      :isVisible="showSignup" 
      @close="showSignup = false"
      @show-login="showLogin = true; showSignup = false"
    />

    <!-- Quick Booking Modal -->
    <QuickBookingModal 
      :isVisible="showBookingModal" 
      @close="showBookingModal = false"
      :initialRoomType="quickBookingInitialData.roomType"
      :initialCheckIn="quickBookingInitialData.checkIn"
      :initialCheckOut="quickBookingInitialData.checkOut"
    />

    <!-- Forgot Password Modal -->
    <ForgotPasswordModal 
      v-if="showForgotPassword"
      :isVisible="true"
      @close="showForgotPassword = false"
      @show-login="showLogin = true; showForgotPassword = false"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import LoginModal from '@/components/LoginModal.vue';
import SignUpModal from '@/components/SignUpModal.vue';
import QuickBookingModal from '@/components/QuickBookingModal.vue';
import ForgotPasswordModal from './components/ForgotPasswordModal.vue';

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    LoginModal,
    SignUpModal,
    QuickBookingModal,
    ForgotPasswordModal
  },
  setup() {
    const route = useRoute();
    const showLogin = ref(false);
    const showSignup = ref(false);
    const showBookingModal = ref(false);
    const showForgotPassword = ref(false);
    const quickBookingInitialData = ref({
      roomType: '',
      checkIn: '',
      checkOut: ''
    });


    // Check if current page is admin page
    const isAdminPage = computed(() => {
      return route.path.startsWith('/admin') || route.name === 'LoginAdmin';
    });

    const openQuickBookingModalWithRoom = (data) => {
      quickBookingInitialData.value = data;
      showBookingModal.value = true;
    };

    return {
      showLogin,
      showSignup,
      showBookingModal,
      showForgotPassword,
      quickBookingInitialData,
      isAdminPage,
      openQuickBookingModalWithRoom,
      isAdminPage,
      openQuickBookingModalWithRoom
    };
  }
};
</script>

<style>
/* Import responsive styles */
@import './assets/responsive.css';

/* App container */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Main content wrapper */
.main-content {
  flex: 1;
  margin-top: 80px; /* Adjust based on header height */
  min-height: calc(100vh - 80px);
  height: auto;
  position: relative;
  overflow: visible;
}

/* Global styles */
html {
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  height: auto !important;
  margin: 0;
  padding: 0;
  overflow-y: auto !important;
}

* {
  box-sizing: border-box;
}

/* Responsive adjustments for main content */
@media (max-width: 768px) {
  .main-content {
    margin-top: 120px; /* Increased margin for mobile header */
  }
}

/* Admin page specific styles */
#app:has(.admin-layout) {
  margin-top: 0;
}

/* Remove margin for admin login page */
.admin-login-page {
  margin-top: 0 !important;
}
</style>
