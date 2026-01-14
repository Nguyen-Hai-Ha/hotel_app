<template>
  <section class="rooms-section">
    <div class="container">
      <h2 class="section-title">{{ $t('rooms.title') }}</h2>
      <div class="room-grid">
        <RoomCard v-for="room in rooms" :key="room.id" :room="room" @book-room="bookRoom" />
      </div>
    </div>

    <!-- Login Modal -->
    <LoginModal :isVisible="showLoginModal" @close="showLoginModal = false"
      @show-signup="showSignupModal = true; showLoginModal = false" />

    <!-- Sign Up Modal -->
    <SignUpModal :isVisible="showSignupModal" @close="showSignupModal = false"
      @show-login="showLoginModal = true; showSignupModal = false" />
  </section>
</template>

<script>
import { ref, onMounted } from 'vue';
import RoomCard from '@/components/RoomCard.vue';
import LoginModal from '@/components/LoginModal.vue';
import SignUpModal from '@/components/SignUpModal.vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'RoomsView',
  components: {
    RoomCard,
    LoginModal,
    SignUpModal
  },
  setup() {
    const router = useRouter();
    const rooms = ref([]);
    const showLoginModal = ref(false);
    const showSignupModal = ref(false);

    // Check if user is authenticated
    const isAuthenticated = () => {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user');
      return token && user;
    };

    onMounted(async () => {
      try {
        const response = await axios.get('https://api.thesecret-hotel.com/api/rooms');
        rooms.value = response.data;
      } catch (error) {
        console.error('Error loading rooms:', error);
      }
    });

    const bookRoom = (room) => {
      // Check authentication before allowing room booking
      if (!isAuthenticated()) {
        // Store the room info in localStorage before showing login modal
        localStorage.setItem('pendingBooking', JSON.stringify({
          roomId: room.id,
          timestamp: new Date().getTime()
        }));
        showLoginModal.value = true;
        return;
      }

      // If authenticated, proceed to booking
      proceedToBooking(room.id);
    };

    const proceedToBooking = (roomId) => {
      // Clear any pending booking
      localStorage.removeItem('pendingBooking');
      // Navigate to room detail
      router.push({ name: 'RoomDetail', params: { id: roomId } });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Watch for authentication changes
    const checkPendingBooking = () => {
      const pendingBooking = localStorage.getItem('pendingBooking');
      if (pendingBooking) {
        const { roomId, timestamp } = JSON.parse(pendingBooking);
        // Check if the pending booking is less than 5 minutes old
        const now = new Date().getTime();
        const fiveMinutes = 5 * 60 * 1000;
        if (now - timestamp < fiveMinutes) {
          proceedToBooking(roomId);
        } else {
          // Clear expired pending booking
          localStorage.removeItem('pendingBooking');
        }
      }
    };

    onMounted(() => {
      // Check for pending booking after component mounts
      if (isAuthenticated()) {
        checkPendingBooking();
      }
    });

    return {
      rooms,
      bookRoom,
      showLoginModal,
      showSignupModal
    };
  }
};
</script>

<style scoped>
.rooms-section {
  padding: 80px 0;
  min-height: auto;
  position: relative;
}

.container {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  text-align: center;
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, var(--booking-blue) 0%, #ff6b35 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, var(--booking-blue) 0%, #ff6b35 100%);
  margin: 1.5rem auto 3rem;
  border-radius: 2px;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .room-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .section-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .rooms-section {
    padding: 60px 0;
  }

  .container {
    padding: 0 1.5rem;
  }

  .room-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    max-width: 500px;
    margin: 2rem auto 0;
  }

  .section-title {
    font-size: 2.2rem;
    margin-bottom: 1.5rem;
  }

  .section-title::after {
    width: 60px;
    margin: 1rem auto 2.5rem;
  }
}

@media (max-width: 480px) {
  .rooms-section {
    padding: 50px 0;
  }

  .container {
    padding: 0 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .room-grid {
    gap: 1rem;
  }
}

/* Animation for room cards */
.room-grid>* {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.room-grid>*:nth-child(1) {
  animation-delay: 0.1s;
}

.room-grid>*:nth-child(2) {
  animation-delay: 0.2s;
}

.room-grid>*:nth-child(3) {
  animation-delay: 0.3s;
}

.room-grid>*:nth-child(4) {
  animation-delay: 0.4s;
}

.room-grid>*:nth-child(5) {
  animation-delay: 0.5s;
}

.room-grid>*:nth-child(6) {
  animation-delay: 0.6s;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
