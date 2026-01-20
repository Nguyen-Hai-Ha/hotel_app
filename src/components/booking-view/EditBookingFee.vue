<script setup>
/**
 * THIS TEMPLATE USING WITH NEW COST > 0
 */
import { computed } from 'vue'

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
  }
})

// Helper function để format tiền tệ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}
</script>
<template>
  <div class="form-section cost-breakdown">
    <h4>Chi tiết chi phí</h4>
    <div class="cost-item">
      <span>Tiền phòng ({{ countLastChange + bookingNightChange }} đêm):</span>
      <p style="margin-bottom: 0;">
        {{ formatCurrency(bookingDetail.invoice?.subtotal ?? 0) }}
        <span style="color: #38a169; font-weight: 700;">
          + {{ formatCurrency((bookingNightChange * (bookingDetail.roomType?.base_price ?? 0)) +
            ((bookingNightChange *
              (bookingDetail.roomType?.base_price ?? 0)) * (bookingDetail.tax?.rate ?? 0) / 100)) }}
        </span>
      </p>
    </div>
    <div class="cost-item" v-if="!isHourlyRental">
      <span>Dịch vụ:</span>
      <p style="margin-bottom: 0;">
        {{ formatCurrency(bookingDetail.invoice?.service_charge ?? 0) }}
        <span style="color: #38a169; font-weight: 700;" v-if="servicesCost > 0">
          + {{ formatCurrency(servicesCost * bookingNightChange) }}
        </span>
      </p>
    </div>
    <div class="cost-item" v-if="!isHourlyRental">
      <span>Tổng phụ:</span>
      <span>
        {{ formatCurrency((bookingDetail.invoice?.subtotal ?? 0) + newCost) }}
      </span>
    </div>
    <!-- <div class="cost-item">
            <span>Thuế:</span>
            <span>{{ formatCurrency(taxAmount) }}</span>
          </div> -->
    <div class="cost-item total">
      <span><strong>Tổng cộng:</strong></span>
      <span v-if="finalGrandTotal > 0" style="display: flex; flex-direction: column; align-items: flex-end;">
        <span style="text-decoration: line-through; color: #999; font-size: 0.9em;">{{
          formatCurrency(grandTotal)
          }}</span>
        <strong style="color: #27ae60; font-size: 1.1em;">{{ formatCurrency(finalGrandTotal)
          }}</strong>
      </span>
      <span v-else><strong>{{ formatCurrency(grandTotal) }}</strong></span>
    </div>
  </div>
</template>
<style scoped>
@import '@/assets/admin-global.css';
</style>
