<template>
  <div class="room-detail-page">
    <div v-if="loading" class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> Loading...
    </div>

    <div v-else-if="roomData" class="room-detail">
      <div class="hotel-header">
        <h1>{{ roomData.room_type.room_type }}</h1>
        <p>Experience luxury and comfort in our premium accommodation</p>
      </div>

      <div class="photo-gallery-simple">
        <img :src="'/images/' + roomData.room_type.image" class="main-image" :alt="roomData.room_type.room_type" />
      </div>

      <div class="detail-content">
        <div class="main-content">
          <h2>{{ $t('detail.features') }}</h2>
          <ul class="features-list">
            <li v-for="feature in roomData.room_type.feature" :key="feature">
              <i class="fas fa-check-circle"></i> {{ feature }}
            </li>
          </ul>

          <h2>{{ $t('detail.availableRooms') }}</h2>
          <div class="room-selection">
            <div v-for="room in roomData.available_rooms" :key="room.id" class="room-option"
              :class="{ 'selected': selectedRoom?.id === room.id, 'unavailable': room.status !== 'available' }"
              @click="selectRoom(room)">
              <div class="room-number" :class="{ 'centered': room.status === 'Occupied' }">Room {{ room.room_number }}
              </div>
              <div class="room-status" :class="room.status" v-if="room.status === 'available'">
                {{ $t('detail.available') }}
              </div>
              <div class="room-status" :class="room.status" v-else-if="room.status === 'Occupied'">
                {{ $t('detail.occupied') }}
              </div>
              <div class="room-status" :class="room.status" v-else-if="room.status === 'Maintenance'">
                {{ $t('detail.maintenance') }}
              </div>
            </div>
          </div>
        </div>

        <div class="booking-sidebar">
          <div class="booking-box">
            <h3>{{ $t('detail.bookRoom') }}</h3>
            <div class="price-display">
              <span class="price">${{ roomData.room_type.base_price }}</span>
              <span class="per-night">/ {{ $t('detail.night') }}</span>
              <hr>
            </div>

            <!-- Optional add-ons -->
            <div class="add-ons-section">
              <h4>{{ $t('detail.services') }}</h4>
              <div class="checkbox-group" v-for="service in services" :key="service.id">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="selectedServices" :value="service.id" />
                  <span class="checkmark"></span>
                  <span class="service-name">{{ service.name }}</span>
                  <span class="service-price">+${{ service.price }}</span>
                </label>
              </div>
            </div>

            <!-- Booking dates -->
            <div class="booking-dates">
              <h4>{{ $t('detail.selectDate') }}</h4>
              <div class="form-group">
                <label>{{ $t('detail.checkIn') }}</label>
                <input type="date" v-model="checkIn" class="date-input" :min="minCheckInDate" />
              </div>
              <div class="form-group">
                <label>{{ $t('detail.checkOut') }}</label>
                <input type="date" v-model="checkOut" class="date-input" :min="minCheckOutDate" />
              </div>
            </div>

            <!-- Total price display -->
            <div class="total-price" v-if="nights() > 0">
              <div class="price-breakdown">
                <span>{{ $t('detail.total') }} {{ nights() }} {{ $t('detail.night') }}:</span>
                <span class="total-amount">${{ calculateTotalPrice() }}</span>
              </div>
            </div>

            <button class="book-btn btn btn-orange" @click.prevent="bookNow"
              :disabled="!selectedRoom || selectedRoom.status !== 'available'">
              {{ selectedRoom ? `${$t('detail.bookRoom')} ${selectedRoom.room_number}` : $t('detail.selectRoomFirst') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error">
      <p>Room not found.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "RoomDetailView",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const roomData = ref(null);
    const loading = ref(true);
    const checkIn = ref('');
    const checkOut = ref('');
    const selectedRoom = ref(null);
    const services = ref([]);
    const selectedServices = ref([]);


    onMounted(async () => {
      try {
        const [roomResponse, servicesResponse] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/rooms/${route.params.id}`),
          axios.get(`http://127.0.0.1:8000/api/services`)
        ]);

        roomData.value = roomResponse.data;
        services.value = servicesResponse.data || [];
      } catch (error) {
        console.error("Error fetching room detail:", error);
      } finally {
        loading.value = false;
      }
    });

    const selectRoom = (room) => {
      if (room.status === 'available') {
        selectedRoom.value = room;
      }
    };
    const getStatusText = (status) => {
      switch (status) {
        case 'available': return 'Available';
        case 'occupied': return 'Occupied';
        case 'maintenance': return 'Maintenance';
        case 'reserved': return 'Reserved';
        default: return status;
      }
    };

    const nights = () => {
      if (!checkIn.value || !checkOut.value) return 0;
      const d1 = new Date(checkIn.value);
      const d2 = new Date(checkOut.value);
      const diffTime = d2 - d1;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    };

    const calculateSelectedServicesTotal = () => {
      return selectedServices.value.reduce((total, serviceId) => {
        const service = services.value.find(s => s.id === serviceId);
        return total + (service ? service.price : 0);
      }, 0);
    };

    const calculateTotalPrice = () => {
      const base = roomData.value?.room_type.base_price || 0;
      const n = nights() || 0;
      const selectedServicesTotal = calculateSelectedServicesTotal();

      return (base * n) + (selectedServicesTotal * n);
    };

    // Computed properties for date validation
    const minCheckInDate = computed(() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    });

    const minCheckOutDate = computed(() => {
      if (!checkIn.value) {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        return today.toISOString().split('T')[0];
      }
      const checkInDate = new Date(checkIn.value);
      checkInDate.setDate(checkInDate.getDate() + 1);
      return checkInDate.toISOString().split('T')[0];
    });

    const bookNow = () => {
      if (!selectedRoom.value || selectedRoom.value.status !== 'available') {
        alert('Please select an available room first');
        return;
      }

      if (!checkIn.value || !checkOut.value) {
        alert('Please select check-in and check-out dates');
        return;
      }

      // Validate dates
      const today = new Date().toISOString().split('T')[0];
      if (checkIn.value < today) {
        alert('Check-in date cannot be in the past');
        return;
      }

      if (checkOut.value <= checkIn.value) {
        alert('Check-out date must be after check-in date');
        return;
      }

      // Tính tổng giá services được chọn
      const selectedServicesTotal = calculateSelectedServicesTotal();

      const query = {
        roomName: roomData.value?.room_type.room_type || '',
        roomImg: roomData.value?.room_type.image || '',
        service: selectedServicesTotal,
        priceRoom: roomData.value?.room_type.base_price * nights(),
        discount: 0,
        checkin: checkIn.value,
        checkout: checkOut.value,
        selectedRoomId: selectedRoom.value.id,
        selectedRoomNumber: selectedRoom.value.room_number
      };

      router.push({
        name: 'Booking',
        params: { id: route.params.id },
        query
      });
    };

    return {
      roomData,
      loading,
      selectedRoom,
      selectRoom,
      getStatusText,
      bookNow,
      nights,
      checkIn,
      checkOut,
      calculateTotalPrice,
      calculateSelectedServicesTotal,
      services,
      selectedServices,
      minCheckInDate,
      minCheckOutDate
    };
  },
};
</script>

<style scoped>
.room-detail-page {
  max-width: 1200px;
  margin: 120px auto 80px auto;
  padding: 0 20px;
}

.loading-spinner {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: var(--booking-blue);
}

.hotel-header {
  text-align: center;
  margin-bottom: 40px;
}

.hotel-header h1 {
  font-size: 3rem;
  color: var(--booking-blue);
  margin-bottom: 10px;
}

.hotel-header p {
  font-size: 1.2rem;
  color: #ccc;
}

.photo-gallery-simple {
  margin-bottom: 40px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.main-image {
  width: 100%;
  height: 550px;
  object-fit: cover;
  display: block;
}

.detail-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 50px;
  align-items: flex-start;
}

.main-content {
  background-color: #2a2a2a;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  margin-top: 0;
  min-height: 0
}

.main-content h2 {
  font-size: 2rem;
  color: var(--booking-blue);
  margin-bottom: 25px;
}

.features-list {
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 1.1rem;
  color: #eee;
}

.features-list li i {
  color: var(--booking-blue);
  font-size: 1.3rem;
}

.room-selection {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.room-option {
  border: 2px solid #ff6b35;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  background-color: var(--vt-c-black-mute);
}

.room-option:hover {
  border-color: var(--booking-blue);
  background-color: rgba(255, 107, 53, 0.1);
  transform: translateY(-2px);
}

.room-option.selected {
  border-color: var(--booking-blue);
  background-color: var(--booking-blue);
  color: white;
}

.room-option.unavailable {
  border-color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
  cursor: not-allowed;
  opacity: 0.6;
}

.room-number {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 8px;
}

.room-number.centered {
  text-align: center;
}

.room-status {
  font-size: 0.9em;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.room-status.available {
  background-color: #ff6b35;
  color: #ffffff;
}

.room-status.occupied {
  background-color: #dc3545;
  color: #ffffff;
}

.room-status.maintenance {
  background-color: #ffc107;
  color: #000000;
}

.room-status.reserved {
  background-color: #17a2b8;
  color: #ffffff;
}

.booking-sidebar {
  position: sticky;
  top: 100px;
  background-color: #2a2a2a;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.booking-box h3 {
  font-size: 1.8rem;
  color: #fff;
  margin-bottom: 20px;
  text-align: center;
}

.price-display {
  text-align: center;
  margin-bottom: 30px;
}

.price {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--booking-blue);
}

.per-night {
  font-size: 1.2rem;
  color: #ccc;
}

.add-ons-section {
  margin-bottom: 30px;
}

.add-ons-section h4 {
  color: #fff;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.checkbox-group {
  margin-bottom: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ccc;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.checkbox-label:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--booking-blue);
}

.service-name {
  flex: 1;
  font-size: 1rem;
}

.service-price {
  color: var(--booking-blue);
  font-weight: 600;
}

.booking-dates {
  margin-bottom: 30px;
}

.booking-dates h4 {
  color: #fff;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #eee;
}

.date-input {
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 2px solid #ff6b35;
  background-color: var(--vt-c-black-mute);
  color: #fff;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.date-input:focus {
  outline: none;
  border-color: var(--booking-blue);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.total-price {
  background-color: var(--vt-c-black-mute);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.price-breakdown {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ccc;
  font-size: 1.1rem;
}

.total-amount {
  color: var(--booking-blue);
  font-weight: bold;
  font-size: 1.3rem;
}

.book-btn {
  width: 100%;
  padding: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.book-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  text-align: center;
  padding: 50px;
  color: #dc3545;
  font-size: 1.2rem;
}

.room-number.centered {
  text-align: center;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .room-detail-page {
    margin: 100px auto 40px auto;
    padding: 0 15px;
  }

  .hotel-header h1 {
    font-size: 2rem;
  }

  .hotel-header p {
    font-size: 1rem;
  }

  .main-image {
    height: 300px;
  }

  .detail-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .main-content {
    padding: 20px;
  }

  .main-content h2 {
    font-size: 1.5rem;
  }

  .features-list li {
    font-size: 1rem;
  }

  .room-selection {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }

  .room-option {
    padding: 12px;
  }

  .booking-sidebar {
    position: static;
    padding: 20px;
  }

  .booking-box h3 {
    font-size: 1.4rem;
  }

  .price {
    font-size: 2rem;
  }

  .checkbox-label {
    padding: 8px;
  }

  .service-name {
    font-size: 0.9rem;
  }

  .total-amount {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .room-selection {
    grid-template-columns: repeat(2, 1fr);
  }

  .room-option {
    padding: 10px;
  }

  .room-number {
    font-size: 1rem;
  }

  .room-status {
    font-size: 0.8em;
    padding: 3px 6px;
  }
}
</style>