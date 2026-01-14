<template>
  <div class="home-page">
    <main>
      <section class="hero">
        <div class="hero-content">
          <h1>{{ $t('home.welcome') }}</h1>
          <p>{{ $t('home.subtitle') }}</p>
          <div class="hero-buttons">
            <router-link to="/" class="btn btn-orange">{{ $t('home.bookNow') }}</router-link>
            <router-link to="/rooms" class="btn btn-outline">{{ $t('home.exploreRooms') }}</router-link>
          </div>
        </div>
      </section>

      <!-- Featured Rooms Section -->
      <section class="rooms-section">
        <div class="container">
          <h2 class="section-title">{{ $t('home.featuredRooms') }}</h2>
          <div class="room-grid">
            <RoomCard v-for="room in rooms" :key="room.id" :room="room" @book-room="bookRoom" />
          </div>
        </div>
      </section>

      <!-- Contact CTA Section -->
      <section class="contact-cta">
        <div class="container">
          <div class="cta-content">
            <h2>{{ $t('booking.title') }}</h2>
            <p>{{ $t('contact.subtitle') }}</p>
            <div class="cta-buttons">
              <router-link to="/contact" class="btn btn-orange">{{ $t('contact.title') }}</router-link>
              <router-link to="/rooms" class="btn btn-outline">{{ $t('rooms.title') }}</router-link>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import RoomCard from '@/components/RoomCard.vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'HomeView',
  components: {
    RoomCard
  },
  setup() {
    const router = useRouter();
    const rooms = ref([]);

    onMounted(async () => {
      try {
        const response = await axios.get('https://api.thesecret-hotel.com/api/rooms');
        rooms.value = response.data.slice(0, 3);
      } catch (error) {
        console.error('Error loading rooms:', error);
      }
    });

    const bookRoom = (room) => {
      router.push({ name: 'RoomDetail', params: { id: room.id } });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return {
      rooms,
      bookRoom
    };
  }
};
</script>

<style scoped>
/* Additional styles specific to HomeView */
/* Rooms Section */
.rooms-section {
  padding: 60px 0;
  background-color: var(--vt-c-black-soft);
}

.section-title {
  text-align: center;
  color: var(--booking-blue);
  font-size: 2.5rem;
  margin-bottom: 40px;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  padding: 0 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Container */
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
}

.contact-cta {
  padding: 60px 20px;
  background: linear-gradient(135deg, #4ade8000, var(--booking-blue-dark));
  text-align: center;
}

.cta-content {
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-content h2 {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 20px;
}

.cta-content p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-buttons .btn {
  min-width: 150px;
}

/* Hero Section Styles */
.hero-content {
  text-align: center;
  padding: 60px 20px;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .hero-content h1 {
    font-size: 2.8rem;
  }

  .cta-content h2 {
    font-size: 2.2rem;
  }

  .room-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .hero-content {
    padding: 40px 20px;
  }

  .hero-content h1 {
    font-size: 2.2rem;
  }

  .hero-content p {
    font-size: 1rem;
  }

  .hero-buttons {
    flex-direction: column;
    gap: 15px;
  }

  .room-grid {
    grid-template-columns: 1fr;
    padding: 0 20px;
  }

  .cta-content h2 {
    font-size: 1.8rem;
  }

  .cta-content p {
    font-size: 1rem;
  }

  .featured-rooms {
    padding: 40px 0;
  }

  .section-title {
    font-size: 1.8rem;
    margin-bottom: 30px;
  }

  .contact-cta {
    padding: 40px 20px;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .cta-buttons .btn {
    width: 100%;
    max-width: 250px;
  }
}

@media (max-width: 480px) {
  .hero-content {
    padding: 30px 15px;
  }

  .hero-content h1 {
    font-size: 1.8rem;
  }

  .btn {
    width: 100%;
  }

  .cta-buttons {
    gap: 10px;
  }

  .contact-cta {
    padding: 30px 15px;
  }
}
</style>
