<script setup>
import { useEditBookingStore } from '@/stores/EditBookingStore'
import { storeToRefs } from 'pinia'

const store = useEditBookingStore()
const { bookingDetail, 
        roomCost, 
        servicesCost, 
        taxAmount, 
        grandTotal,
        countLastChange,
        bookingNightChange,
        subtotal } = storeToRefs(store)

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
          + {{ formatCurrency(roomCost) }}
        </span>
      </p>
    </div>

    <div class="cost-item">
      <span>Dịch vụ:</span>
      <p style="margin-bottom: 0;">
        {{ formatCurrency(bookingDetail.invoice?.service_charge ?? 0) }}
        <span style="color: #38a169; font-weight: 700;" v-if="servicesCost > 0">
          + {{ formatCurrency(servicesCost * bookingNightChange) }}
        </span>
      </p>
    </div>

    <div class="cost-item">
      <span>Tổng phụ:</span>
      <span>
        {{ formatCurrency(bookingDetail.invoice?.subtotal + (subtotal ?? 0) ) }}
      </span> 
    </div>

    <div class="cost-item">
      <span>Thuế:</span>
      <p>{{ formatCurrency(bookingDetail.invoiceTax?.amount ?? 0) }} +
        <span style="color: #38a169; font-weight: 700;" v-if="taxAmount > 0">{{ formatCurrency(taxAmount) }}</span>
      </p>
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
