<script setup>
import { onMounted } from 'vue'

import { storeToRefs } from 'pinia'
import { useAddBookingStore } from '@/stores/AddBookingStore'

const store = useAddBookingStore()
const {
    roomTypes, rooms, availableRooms, newBookingForAdmin,
    onRoomTypeChange, submitAddBookingAdmin,

} = storeToRefs(store)
const { fetchRoomTypes, fetchRooms, closeAddBookingForAdminModal} = store

onMounted(async () => {
    const promises = []
    if (roomTypes.value.length === 0) {
        promises.push(fetchRoomTypes())
    }
    if (rooms.value.length === 0) {
        promises.push(fetchRooms())
    }
    await Promise.all(promises)
})
</script>

<template>
  <div class="modal-content" @click.stop>
      <div class="modal-header">
          <h3>Thêm đặt phòng cho Admin</h3>
          <button @click="closeAddBookingForAdminModal" class="modal-close">
              <FontAwesomeIcon :icon="['fas', 'times']" />
          </button>
      </div>
      <form class="modal-form" @submit.prevent="submitAddBookingAdmin">
          <div class="form-group">
              <label for="roomType">Loại phòng *</label>
              <select id="roomType" v-model="newBookingForAdmin.roomTypeId" @change="onRoomTypeChange" required
                  class="form-select">
                  <option value="">Chọn loại phòng</option>
                  <option v-for="roomType in roomTypes" :key="roomType.id" :value="roomType.id">
                      {{ roomType.name }}
                  </option>
              </select>
          </div>
          <div class="form-group">
              <label for="availableRooms">Phòng có sẵn *</label>
              <select id="availableRooms" v-model="newBookingForAdmin.roomId" required class="form-select"
                  :disabled="!newBookingForAdmin.roomTypeId">
                  <option value="">Chọn phòng</option>
                  <option v-for="room in availableRooms" :key="room.id" :value="room.id">
                      Phòng {{ room.room_number }}
                  </option>
              </select>
          </div>

          <div class="form-row">
              <div class="form-group">
                  <label for="checkIn">Ngày nhận phòng *</label>
                  <input id="checkIn" v-model="newBookingForAdmin.checkIn" type="datetime-local" required />
              </div>
          </div>

          <div class="modal-actions">
              <button type="button" @click="closeAddBookingForAdminModal" class="btn btn-outline">
                  Hủy
              </button>
              <button type="submit" class="btn btn-primary">
                  <FontAwesomeIcon :icon="['fas', 'save']" />
                  Tạo đặt phòng
              </button>
          </div>
      </form>
  </div>
</template>
<style scoped>
@import '@/assets/admin-global.css';
</style>
