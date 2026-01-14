<script>
export default {
  name: 'RoomCard',
  props: {
    room: {
      type: Object,
      required: true
    }
  },
  emits: ['book-room'],
  setup(props, { emit }) {
    const bookRoom = () => {
      emit('book-room', props.room)
    }
    return {
      bookRoom
    }
  }
}
</script>
<template>
  <div class="room-card">
    <img :src="'/images/' + room.image"  :alt="room.room_number">
    <div class="room-info">
      <h3>{{ room.room_type }}</h3>
      <p class="price">${{ room.base_price }}/{{ $t('rooms.pricePerNight') }}</p>
      <p class="description">{{ room.description }}</p>
      <!-- Removed features as they are not in the current backend schema -->
      <!-- <ul class="features">
        <li v-for="feature in room.features" :key="feature"><i class="fas fa-check"></i> {{ feature }}</li>
      </ul> -->
      <button @click="bookRoom" class="btn btn-orange">{{ $t('rooms.bookRoom') }}</button>
    </div>
  </div>
</template>

<style scoped>
.room-card {
  background: var(--vt-c-black-soft);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.room-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(255, 107, 53, 0.2);
}

.room-card img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  display: block;
}

.room-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #282828;
}

.room-info h3 {
  font-size: 1.5rem;
  color: var(--booking-blue);
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.price {
  font-size: 1.2rem;
  color: #e5e7eb;
  margin-bottom: 1rem;
  font-weight: 500;
}

.description {
  color: #9ca3af;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  flex: 1;
  font-size: 0.95rem;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .room-card {
    display: grid;
    grid-template-columns: 1.2fr 2fr;
    max-height: 220px;
  }
  
  .room-card img {
    height: 100%;
    width: 100%;
  }
  
  .room-info {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
  }
  
  .room-info h3 {
    font-size: 1.3rem;
  }
  
  .price {
    font-size: 1.1rem;
  }
  
  .description {
    flex: 1;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
}

@media (max-width: 768px) {
  .room-card {
    grid-template-columns: 1fr;
    max-width: 500px;
    margin: 0 auto;
    max-height: none;
  }
  
  .room-card img {
    height: 200px;
  }
  
  .room-info {
    gap: 0.75rem;
  }
  
  .description {
    -webkit-line-clamp: unset;
  }
}

@media (max-width: 480px) {
  .room-card {
    border-radius: 8px;
  }

  .room-card img {
    height: 180px;
  }
  
  .room-info {
    padding: 1rem;
  }
  
  .room-info h3 {
    font-size: 1.2rem;
    margin-bottom: 0.25rem;
  }
  
  .price {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    color: #e5e7eb;
  }
  
  .description {
    font-size: 0.9rem;
    margin-bottom: 1rem;
    line-height: 1.5;
  }
  
  .btn {
    padding: 0.75rem;
    font-size: 0.9rem;
    border-radius: 6px;
  }
}
</style>
