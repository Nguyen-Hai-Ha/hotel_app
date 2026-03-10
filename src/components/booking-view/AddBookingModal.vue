<script setup>
import { onMounted } from 'vue'
import { useAddBookingStore } from '@/stores/AddBookingStore'
import { storeToRefs } from 'pinia'

const store = useAddBookingStore()
const { newBooking, roomTypes, rooms,
        isHourlyRental, availableRooms, services, taxes, grandTotal,
        finalGrandTotal, roomCost, servicesCost, subtotal, taxAmount,
        bookingNights,
      } = storeToRefs(store)
const { fetchRoomTypes, fetchRooms, applyDiscount, fetchTaxes,
        onRoomTypeChange, clickChangeRental, formatCurrency,
        submitAddBooking, formatDate, fetchServices
      } = store

onMounted(async () => {
  const promises = []
    if (services.value.length === 0) {
        promises.push(fetchServices())
    }
    if (taxes.value.length === 0) {
        promises.push(fetchTaxes())
    }
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
  <div class="modal-contents" @click.stop>
      <div class="modal-header">
          <h3>Thêm đặt phòng mới</h3>
          <button @click="closeAddBookingModal" class="modal-close">
              <FontAwesomeIcon :icon="['fas', 'times']" />
          </button>
      </div>

      <form @submit.prevent="submitAddBooking" class="modal-form">
          <!-- Customer Information -->
          <div class="form-section">
              <h4>Thông tin khách hàng</h4>
              <div class="form-row">
                  <div class="form-group">
                      <label for="customerName">Tên khách hàng *</label>
                      <input ref="BookingNameInput" id="customerName" v-model="newBooking.customerName"
                          type="text" required placeholder="Nhập tên khách hàng" tabindex="1"
                          @click="$event.target.focus()" @mousedown="$event.target.focus()" />
                  </div>
                  <div class="form-group">
                      <label for="customerPhone">Số điện thoại *</label>
                      <input id="customerPhone" v-model="newBooking.customerPhone" type="tel" required
                          placeholder="Nhập số điện thoại" />
                  </div>
              </div>
              <div class="form-row">
                  <div class="form-group">
                      <label for="customerEmail">Email</label>
                      <input id="customerEmail" v-model="newBooking.customerEmail" type="email"
                          placeholder="Nhập email" />
                  </div>
                  <div class="form-group">
                      <label for="customerPassport">CMND/CCCD *</label>
                      <input id="customerPassport" v-model="newBooking.customerPassport" type="text" required
                          placeholder="Nhập CMND/CCCD" />
                  </div>
              </div>
          </div>

          <!-- Room Selection -->
          <div class="form-section">
              <h4>Thông tin phòng</h4>
              <div class="form-row">
                  <div class="form-group">
                      <label for="roomType">Loại phòng *</label>
                      <select id="roomType" v-model="newBooking.roomTypeId" @change="onRoomTypeChange" required
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
                      <select id="availableRooms" v-model="newBooking.roomId" required class="form-select"
                          :disabled="!newBooking.roomTypeId">
                          <option value="">Chọn phòng</option>
                          <option v-for="room in availableRooms" :key="room.id" :value="room.id">
                              Phòng {{ room.room_number }}
                          </option>
                      </select>
                  </div>

                  <div class="form-group">
                      <label>Hình thức thuê</label>
                      <div class="rental-toggle">
                          <input type="radio" name="rental_type" id="hourly" value="hourly" v-model="rental"
                              @click="clickChangeRental" class="rental-radio" />
                          <label for="hourly" class="rental-pill">
                              Theo giờ
                          </label>
                          <input type="radio" name="rental_type" id="daily" value="daily" v-model="rental"
                              @click="clickChangeRental" class="rental-radio" />
                          <label for="daily" class="rental-pill">
                              Theo ngày
                          </label>
                      </div>
                  </div>

                  <div class="form-group">
                      <label for="roomPrice">Giá phòng (điều chỉnh)</label>
                      <input id="roomPrice" v-model="newBooking.roomPrice" type="number" />
                  </div>
              </div>

              <div class="form-row">
                  <div v-if="isHourlyRental" class="form-group">
                      <label for="checkIn">Giờ nhận phòng *</label>
                      <input id="checkIn" v-model="newBooking.checkIn" type="datetime-local" required />
                  </div>
                  <template v-else>
                      <div class="form-group">
                          <label for="checkIn">Ngày nhận phòng *</label>
                          <input id="checkIn" v-model="newBooking.checkIn" type="datetime-local" required />
                      </div>
                      <div class="form-group">
                          <label for="checkOut">Ngày trả phòng *</label>
                          <input id="checkOut" v-model="newBooking.checkOut" type="datetime-local" required />
                      </div>
                  </template>
              </div>

              <div class="form-group" v-if="!isHourlyRental">
                  <label>Số đêm: <strong>{{ bookingNights }}</strong></label>
              </div>
          </div>

          <!-- Services Selection -->
          <div class="form-section" v-if="!isHourlyRental && services.length > 0">
              <h4>Dịch vụ bổ sung</h4>
              <div class="services-selection">
                  <div v-for="service in services" :key="service.id" class="service-item">
                      <div class="service-info">
                          <label class="service-checkbox">
                              <input type="checkbox" :value="service.id" v-model="newBooking.selectedServices" />
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

          <!-- Tax Selection -->
          <div class="form-section" v-if="!isHourlyRental">
              <h4>Thuế áp dụng</h4>
              <div class="tax-selection">
                  <div v-for="tax in taxes" :key="tax.id" class="tax-item">
                      <label class="tax-checkbox">
                          <input type="checkbox" :value="tax.id" v-model="newBooking.selectedTaxes" />

                          <span>{{ tax.name }} ({{ tax.rate }}%)</span>
                      </label>
                  </div>
              </div>
          </div>

          <div class="form-section">
              <h4>Giảm giá áp dụng (%)</h4>
              <div class="discount-selection">
                  <div class="discount-item" style="width: 25%;">
                      <input type="number" v-model="newBooking.discount" />
                      <button type="button" @click="applyDiscount">Áp
                          dụng</button>
                  </div>
              </div>
          </div>

          <!-- Cost Breakdown -->
          <div class="form-section cost-breakdown" v-if="isHourlyRental">
              <h4>Chi tiết chi phí</h4>
              <div class="cost-item">
                  <span>Tiền phòng:</span>
                  <span>{{ formatCurrency(roomCost) }}</span>
              </div>
              <div class="cost-item total">
                  <span><strong>Tổng cộng:</strong></span>
                  <!-- Hiển thị cả 2 giá khi có discount -->
                  <span v-if="finalGrandTotal > 0"
                      style="display: flex; flex-direction: column; align-items: flex-end;">
                      <span style="text-decoration: line-through; color: #999; font-size: 0.9em;">{{
                          formatCurrency(grandTotal)
                          }}</span>
                      <strong style="color: #27ae60; font-size: 1.1em;">{{ formatCurrency(finalGrandTotal)
                          }}</strong>
                  </span>
                  <!-- Hiển thị giá gốc khi chưa discount -->
                  <span v-else><strong>{{ formatCurrency(grandTotal) }}</strong></span>
              </div>
          </div>

          <div class="form-section cost-breakdown" v-else>
              <h4>Chi tiết chi phí</h4>
              <div class="cost-item">
                  <span>Tiền phòng ({{ bookingNights }} đêm):</span>
                  <span>{{ formatCurrency(roomCost) }}</span>
              </div>
              <div class="cost-item" v-if="!isHourlyRental">
                  <span>Dịch vụ:</span>
                  <span>{{ formatCurrency(servicesCost * bookingNights) }}</span>
              </div>
              <div class="cost-item" v-if="!isHourlyRental">
                  <span>Tổng phụ:</span>
                  <span>{{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="cost-item">
                  <span>Thuế:</span>
                  <span>{{ formatCurrency(taxAmount) }}</span>
              </div>
              <div class="cost-item total">
                  <span><strong>Tổng cộng:</strong></span>
                  <!-- Hiển thị cả 2 giá khi có discount -->
                  <span v-if="finalGrandTotal > 0"
                      style="display: flex; flex-direction: column; align-items: flex-end;">
                      <span style="text-decoration: line-through; color: #999; font-size: 0.9em;">{{
                          formatCurrency(grandTotal)
                          }}</span>
                      <strong style="color: #27ae60; font-size: 1.1em;">{{ formatCurrency(finalGrandTotal)
                          }}</strong>
                  </span>
                  <!-- Hiển thị giá gốc khi chưa discount -->
                  <span v-else><strong>{{ formatCurrency(grandTotal) }}</strong></span>
              </div>
          </div>

          <div class="modal-actions">
              <button type="button" @click="closeAddBookingModal" class="btn btn-outline">
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

/* Rental Type Toggle */
.rental-toggle {
    display: inline-flex;
    background: #f1f5f9;
    border-radius: 10px;
    padding: 4px;
    gap: 4px;
    border: 1px solid #e2e8f0;
}

.rental-radio {
    display: none;
}

.rental-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 7px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    white-space: nowrap;
}

.rental-pill:hover {
    background: #e2e8f0;
    color: #334155;
}

.rental-radio:checked+.rental-pill {
    background: #4f46e5;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.35);
}
</style>
