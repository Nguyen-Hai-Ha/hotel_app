<template>
  <div class="modal-contents" @click.stop>
    <div class="modal-header">
      <h3>Sửa đặt phòng</h3>
      <button @click="closeEditBookingModal" class="modal-close">
        <FontAwesomeIcon :icon="['fas', 'times']" />
      </button>
    </div>

    <form @submit.prevent="submitEditBooking" class="modal-form">
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
            <select id="roomType" v-model="state.editBookings.roomTypeId" @change="onRoomTypeChange" required
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
          <div v-if="isHourlyRental" class="form-group">
            <label for="checkIn">Giờ nhận phòng *</label>
            <input id="checkIn" v-model="editBookings.checkIn" type="datetime-local" required />
          </div>
          <template v-else>
            <div class="form-group">
              <label for="checkIn">Ngày nhận phòng *</label>
              <input id="checkIn" v-model="editBookings.checkIn" type="datetime-local" required />
            </div>
            <div class="form-group">
              <label for="checkOut">Ngày trả phòng *</label>
              <input id="checkOut" v-model="editBookings.checkOut" type="datetime-local" required />
            </div>
          </template>
        </div>

        <div class="form-group" v-if="!isHourlyRental && earlyCheckOutCost == 0">
          <label>Số đêm: <strong>{{ countLastChange + bookingNightChange || bookingNights }}</strong></label>
        </div>
        <div class="form-group" v-else-if="earlyCheckOutCost > 0">
          <label>Số đêm: <strong>{{ bookingNights }}</strong></label>
        </div>
      </div>

      <div class="form-section" v-if="!state.isHourlyRental && state.earlyCheckOutCost == 0">
        <h4>Dịch vụ bổ sung</h4>
        <div class="services-selection">
          <div v-for="service in state.services" :key="service.id" class="service-item">
            <div class="service-info">
              <label class="service-checkbox">
                <input type="checkbox" :value="service.id" v-model="state.editBookings.selectedServices" />
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
          <div v-for="tax in state.taxes" :key="tax.id" class="tax-item">
            <label class="tax-checkbox">
              <input type="checkbox" :value="tax.id" v-model="state.editBookings.selectedTaxes" />
              <span>{{ tax.name }} ({{ tax.rate }}%)</span>
            </label>
          </div>
        </div>
      </div>

      <div class="form-section cost-breakdown" v-if="state.isHourlyRental">
        <h4>Chi tiết chi phí</h4>
        <div class="cost-item">
          <span>Tiền phòng:</span>
          <span>{{ formatCurrency(state.roomCost) }}</span>
        </div>
        <div class="cost-item total">
          <span><strong>Tổng cộng:</strong></span>
          <span v-if="finalGrandTotal > 0" style="display: flex; flex-direction: column; align-items: flex-end;">
            <span style="text-decoration: line-through; color: #999; font-size: 0.9em;">{{
              formatCurrency(grandTotal)
            }}</span>
            <strong style="color: #27ae60; font-size: 1.1em;">{{ formatCurrency(state.finalGrandTotal)
            }}</strong>
          </span>
          <span v-else><strong>{{ formatCurrency(state.grandTotal) }}</strong></span>
        </div>
      </div>

      <!-- CHI TIẾT PHÍ -->
      <div v-else>
        <EditBookingFee v-if="state.newCost > 0" :booking-detail="bookingDetail" :new-cost="newCost" :subtotal="subtotal"
          :services-cost="servicesCost" :booking-night-change="bookingNightChange" :count-last-change="countLastChange"
          :grand-total="grandTotal" :final-grand-total="finalGrandTotal" :is-hourly-rental="isHourlyRental" :room-cost="roomCost" 
          :tax-amount="taxAmount"/>

        <EditBookingFeeNotNewCost v-else-if="state.newCost <= 0 && state.newCostToChange <= 0 && earlyCheckOutCost <= 0"
          :booking-detail="bookingDetail" :subtotal="subtotal" :services-cost="servicesCost"
          :count-last-change="countLastChange" :booking-nights="bookingNights" :grand-total="grandTotal"
          :is-hourly-rental="isHourlyRental" :tax-amount="taxAmount" :room-type-changed="roomTypeChanged"
          :selected-room-type="selectedRoomType" />

        <EditBookingFeeChangeRoom v-else-if="state.newCostToChange > 0" :booking-detail="bookingDetail" :subtotal="subtotal"
          :services-cost="servicesCost" :count-last-change="countLastChange" :booking-nights="bookingNights"
          :grand-total="grandTotal" :tax-amount="taxAmount" :selected-room-type="selectedRoomType"
          :room-type-changed="roomTypeChanged" :new-cost-to-change="newCostToChange"
          :old-room-cost-stayed="oldRoomCostStayed" :days-stayed="daysStayed" :days-remaining="daysRemaining" />

        <EditBookingFeeEarly v-else-if="state.earlyCheckOutCost > 0" :booking-detail="bookingDetail" :subtotal="subtotal"
          :services-cost="servicesCost" :count-last-change="countLastChange" :booking-nights="bookingNights"
          :grand-total="grandTotal" :tax-amount="taxAmount" :selected-room-type="selectedRoomType"
          :room-type-changed="roomTypeChanged" :early-check-out-cost="earlyCheckOutCost" :days-stayed="daysStayed" />
      </div>

      <div class="modal-actions">
        <button type="button" @click="state.closeEditBookingModal" class="btn btn-outline">
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

<script>
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
  isHourlyRental, bookingNights, countLastChange, finalGrandTotal,
  roomCost, taxAmount, servicesCost, subtotal, grandTotal,  bookingDetail,
  newCost, newCostToChange, earlyCheckOutCost, roomTypeChanged,
  selectedRoomType, editBookingNameInput // Ref từ store
} = storeToRefs(store)

// Destructure actions (không cần storeToRefs)
const { 
  fetchRoomTypes, fetchServices, fetchTaxes, 
  loadBookingData, closeEditBookingModal, submitEditBooking, onRoomTypeChange 
} = store

// Props
const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
  bookingId: {
    type: Number,
    default: null
  }
})

// Watchers
watch(() => props.bookingId, async (newId) => {
  if (newId && props.showModal) {
    await loadBookingData(newId)
  }
}, { immediate: true })

// Lifecycle: Gọi load data master (room types, services...) khi component mount
onMounted(async () => {
  await fetchRoomTypes()
  await fetchServices()
  await fetchTaxes()
})

</script>

<style scoped>
@import '@/assets/admin-global.css';
</style>
