<template>
  <div class="modal-contents" @click.stop>
    <div class="modal-header">
      <h3>Sửa đặt phòng</h3>
      <button @click="closeEditBookingModal" class="modal-close">
        <FontAwesomeIcon :icon="['fas', 'times']" />
      </button>
    </div>

    <form @submit.prevent="handleFormSubmit" class="modal-form">
      <div class="form-section">
        <h4>Thông tin khách hàng</h4>
        <div class="form-row">
          <div class="form-group">
            <label for="customerName">Tên khách hàng *</label>
            <input ref="editBookingNameInput" id="customerName" v-model="editBookings.customerName" type="text" required
              placeholder="Nhập tên khách hàng" tabindex="1" @click="$event.target.focus()"
              @mousedown="$event.target.focus()" />
          </div>
          <div class="form-group">
            <label for="customerPhone">Số điện thoại *</label>
            <input id="customerPhone" v-model="editBookings.customerPhone" type="tel" required
              placeholder="Nhập số điện thoại" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="customerEmail">Email</label>
            <input id="customerEmail" v-model="editBookings.customerEmail" type="email" placeholder="Nhập email" />
          </div>
          <div class="form-group">
            <label for="customerPassport">CMND/CCCD *</label>
            <input id="customerPassport" v-model="editBookings.customerPassport" type="text" required
              placeholder="Nhập CMND/CCCD" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4>Thông tin phòng</h4>
        <div class="form-row">
          <div class="form-group">
            <label for="roomType">Loại phòng *</label>
            <select id="roomType" v-model="editBookings.roomTypeId" @change="onRoomTypeChange" required
              class="form-select">
              <option value="">Chọn loại phòng</option>
              <option v-for="roomType in roomTypes" :key="roomType.id" :value="roomType.id">
                {{ roomType.name }} - {{ formatCurrency(roomType.base_price) }}/{{ roomType.type ===
                  'hourly' ? 'giờ' : 'đêm' }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="availableRooms">Phòng có sẵn *</label>
            <select id="availableRooms" v-model="editBookings.roomId" required class="form-select"
              :disabled="!editBookings.roomTypeId">
              <option value="">Chọn phòng</option>
              <option v-for="room in availableRooms" :key="room.id" :value="room.id">
                Phòng {{ room.room_number }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="roomPrice">Giá phòng (điều chỉnh)</label>
            <input id="roomPrice" v-model="editBookings.roomPrice" type="number" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="checkIn">Ngày nhận phòng *</label>
            <input id="checkIn" v-model="editBookings.checkIn" type="datetime-local" required />
          </div>
          <div class="form-group">
            <label for="checkOut">Ngày trả phòng *</label>
            <input id="checkOut" v-model="editBookings.checkOut" type="datetime-local" required />
          </div>
        </div>

        <div class="form-group" v-if="earlyCheckOutCost == 0">
          <label>Số đêm: <strong>{{ countLastChange + bookingNightChange || bookingNights }}</strong></label>
        </div>
        <div class="form-group" v-else-if="earlyCheckOutCost > 0">
          <label>Số đêm: <strong>{{ bookingNights }}</strong></label>
        </div>
      </div>

      <div class="form-section" v-if="earlyCheckOutCost == 0">
        <h4>Dịch vụ bổ sung</h4>
        <div class="services-selection">
          <div v-for="service in services" :key="service.id" class="service-item">
            <div class="service-info">
              <label class="service-checkbox">
                <input type="checkbox" :value="service.id" v-model="editBookings.selectedServices" />
                <div class="service-details">
                  <strong>{{ service.name }}</strong>
                  <p>{{ service.description }}</p>
                  <span class="service-price">{{ formatCurrency(service.price) }}</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="form-section" v-if="roomTypeChanged">
        <h4>Thuế áp dụng</h4>
        <div class="tax-selection">
          <div v-for="tax in taxes" :key="tax.id" class="tax-item">
            <label class="tax-checkbox">
              <input type="checkbox" :value="tax.id" v-model="editBookings.selectedTaxes" />
              <span>{{ tax.name }} ({{ tax.rate }}%)</span>
            </label>
          </div>
        </div>
      </div>

      <!-- CHI TIẾT PHÍ -->
      <div>
        <EditBookingFee v-if="newCost > 0 && newCostToChange <= 0 && earlyCheckOutCost <= 0" />

        <EditBookingFeeNotNewCost v-else-if="newCost <= 0 && newCostToChange <= 0 && earlyCheckOutCost <= 0" />

        <EditBookingFeeChangeRoom v-else-if="newCostToChange > 0" />

        <EditBookingFeeEarly v-else-if="earlyCheckOutCost > 0" />
      </div>

      <div class="modal-actions">
        <button type="button" @click="closeEditBookingModal" class="btn btn-outline">
          Hủy
        </button>
        <button type="submit" class="btn btn-primary">
          <FontAwesomeIcon :icon="['fas', 'save']" />
          Cập nhật đặt phòng
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { onMounted, watch } from 'vue'
import EditBookingFee from './EditBookingFee.vue'
import EditBookingFeeNotNewCost from './EditBookingFeeNotNewCost.vue'
import EditBookingFeeChangeRoom from './EditBookingFeeChangeRoom.vue'
import EditBookingFeeEarly from './EditBookingFeeEarly.vue'

// Store
import { useEditBookingStore } from '@/stores/EditBookingStore'
import { storeToRefs } from 'pinia'

// Khởi tạo store
const store = useEditBookingStore()


// Destructure state/getters để giữ tính reactive (quan trọng!)
const {
  editBookings, availableRooms, roomTypes, bookingNightChange,
  bookingNights, countLastChange, roomTypeChanged,
  newCost, newCostToChange, earlyCheckOutCost,
  editBookingNameInput, selectedBookingIdForEdit,
  showEditBookingModal, services, taxes
} = storeToRefs(store)

// Destructure actions (không cần storeToRefs)
const {
  loadBookingData, submitEditBooking, onRoomTypeChange, closeEditBookingModal,
  formatCurrency, fetchRoomTypes, fetchServices, fetchTaxes
} = store

const emit = defineEmits(['refresh'])

onMounted(async () => {
  // Chỉ fetch dữ liệu nếu trong store chưa có (tránh gọi API nhiều lần)
  const promises = []

  if (!roomTypes.value || roomTypes.value.length === 0) {
    promises.push(fetchRoomTypes())
  }

  if (!services.value || services.value.length === 0) {
    promises.push(fetchServices())
  }

  if (!taxes.value || taxes.value.length === 0) {
    promises.push(fetchTaxes())
  }

  if (promises.length > 0) {
    await Promise.all(promises)
  }
})

const handleFormSubmit = async () => {
  try {
    const result = await store.submitEditBooking()
    if (result) {
      emit('refresh')
      closeEditBookingModal()
    }
  } catch (err) {
    alert(err.message)
  }
}

// Watchers
watch(() => selectedBookingIdForEdit.value, async (newId) => {
  if (newId && showEditBookingModal.value) {
    await loadBookingData(newId)
  }
}, { immediate: true })

</script>

<style scoped>
@import '@/assets/admin-global.css';
</style>
