<template>
  <div class="modal" v-if="isVisible">
    <div class="modal-content">
      <span class="close" @click="$emit('close')">&times;</span>
      <h2>Quick Booking</h2>
      <form @submit.prevent="handleQuickBooking">
        <div class="form-row">
          <div class="form-group">
            <input type="date" v-model="quickBooking.checkIn" required>
          </div>
          <div class="form-group">
            <input type="date" v-model="quickBooking.checkOut" required>
          </div>
        </div>
        <div class="form-group">
          <select v-model="quickBooking.roomType" required>
            <option value="">Select Room Type</option>
            <option value="standard">Standard Room</option>
            <option value="deluxe">Deluxe Room</option>
            <option value="suite">Suite</option>
            <option value="presidential">Presidential Suite</option>
          </select>
        </div>
        <button type="submit" class="btn btn-orange">Book Now</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'; // Import watch

export default {
  name: 'QuickBookingModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    initialRoomType: {
      type: String,
      default: ''
    },
    initialCheckIn: {
      type: String,
      default: ''
    },
    initialCheckOut: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'quick-booking-success'],
  setup(props, { emit }) {
    const quickBooking = ref({
      checkIn: '',
      checkOut: '',
      roomType: ''
    });

    // Watch for changes in props and update quickBooking ref
    watch(() => props.isVisible, (newVal) => {
      if (newVal) {
        // Only pre-fill if the modal is becoming visible and initial values are provided
        if (props.initialRoomType) {
          quickBooking.value.roomType = props.initialRoomType;
        }
        if (props.initialCheckIn) {
          quickBooking.value.checkIn = props.initialCheckIn;
        }
        if (props.initialCheckOut) {
          quickBooking.value.checkOut = props.initialCheckOut;
        }
      }
    });

    const handleQuickBooking = () => {
      if (quickBooking.value.checkIn && quickBooking.value.checkOut && quickBooking.value.roomType) {
        alert(`Quick booking confirmed! We\'ve sent a confirmation to your email.`);
        emit('quick-booking-success');
        emit('close');
        quickBooking.value = {
          checkIn: '',
          checkOut: '',
          roomType: ''
        };
      } else {
        alert('Please fill in all required fields');
      }
    };

    onMounted(() => {
      const today = new Date().toISOString().split('T')[0];
      quickBooking.value.checkIn = today;
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      quickBooking.value.checkOut = tomorrow.toISOString().split('T')[0];
    });

    return {
      quickBooking,
      handleQuickBooking
    };
  }
}
</script>

<style scoped>
/* Styles are handled by layout-styles.css */
</style>
