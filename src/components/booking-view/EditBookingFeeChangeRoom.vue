<script setup>
/**
* THIS TEMPLATE USING WITH NEW COST = 0
*/
import { computed, onMounted } from 'vue'

// Props nhận từ component cha
const props = defineProps({
  bookingDetail: {
    type: Object,
    required: true,
    default: () => ({})
  },
  newCost: {
    type: Number,
    default: 0
  },
  servicesCost: {
    type: Number,
    default: 0
  },
  bookingNightChange: {
    type: Number,
    default: 0
  },
  countLastChange: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
  },
  finalGrandTotal: {
    type: Number,
    default: 0
  },
  isHourlyRental: {
    type: Boolean,
    default: false
  },
  roomTypeChanged: {
    type: Boolean,
    default: false
  },
  selectedRoomType: {
    type: Object,
    default: null
  },
  bookingNights: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  daysStayed: {
    type: Number,
    default: 0
  },
  daysRemaining: {
    type: Number,
    default: 0
  },
  newCostToChange: {
    type: Number,
    default: 0
  },
  oldRoomCostStayed: {
    type: Number,
    default: 0
  }
})
// Helper function để format tiền tệ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}
console.log("Phòng đã đổi:", props.selectedRoomType);

</script>
<template>
  <div class="form-section cost-breakdown">
    <h4>Chi tiết chi phí</h4>
    <div class="cost-item">
      <span>Tiền phòng đã ở ({{ daysStayed }} đêm):</span>
      <span>{{ formatCurrency(oldRoomCostStayed) }}</span>
    </div>
    <div class="cost-item">
      <span>Tiền phòng mới ({{ daysRemaining }} đêm):</span>
      <span>{{ formatCurrency(newCostToChange) }}</span>
    </div>
    <div class="cost-item">
      <span>Dịch vụ:</span>
      <p style="margin-bottom: 0;">
        {{ formatCurrency(bookingDetail.invoice?.service_charge ?? 0) }}
        <span style="color: #38a169; font-weight: 700;" v-if="servicesCost > 0">
          + {{ formatCurrency(servicesCost) }}
        </span>
      </p>
    </div>

    <div class="cost-item">
      <span>Tổng phụ:</span>
      <span v-if="roomTypeChanged && selectedRoomType">{{ formatCurrency(subtotal) }}</span>
      <span v-else>{{ formatCurrency(subtotal ?? 0) }}</span>
    </div>

    <div class="cost-item" v-if="roomTypeChanged && selectedRoomType">
      <span>Thuế:</span>
      <span>{{ formatCurrency(taxAmount) }}</span>
    </div>

    <div class="cost-item total">
      <span><strong>Tổng cộng:</strong></span>
      <span><strong>{{ formatCurrency(grandTotal) }}</strong></span>
    </div>

  </div>

</template>
<style scoped>
@import '@/assets/admin-global.css';
</style>