<script setup>
import { useEditBookingStore } from '@/stores/EditBookingStore'
import { storeToRefs } from 'pinia'
const editBookingStore = useEditBookingStore()
const { bookingDetail, 
  servicesCost, 
  grandTotal,
  taxAmount, 
  subtotal, 
  daysStayed,
  earlyCheckOutCost,
} = storeToRefs(editBookingStore)
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
      <span>Tiền phòng ({{ daysStayed }} đêm):</span>
      <p>{{  formatCurrency(bookingDetail.invoice?.subtotal ?? 0) }} ->
        <span style="color: #C53030; font-weight: 700;">{{ formatCurrency(earlyCheckOutCost) }}</span>
      </p>
    </div>

    <div class="cost-item">
      <span>Dịch vụ:</span>
      <p style="margin-bottom: 0;">
        {{ formatCurrency(bookingDetail.invoice?.service_charge ?? 0) }} ->
        <span style="color: #C53030; font-weight: 700;" v-if="servicesCost > 0">
           {{ formatCurrency(servicesCost) }}
        </span>
      </p>
    </div>

    <div class="cost-item">
      <span>Tổng phụ:</span>
      <span>{{ formatCurrency(subtotal) }}</span>
    </div>

    <div class="cost-item">
      <span>Thuế:</span>
      <p>{{ formatCurrency(bookingDetail.invoiceTax.amount ?? 0) }} ->
        <span style="color: #C53030; font-weight: 700;" v-if="taxAmount > 0">{{ formatCurrency(taxAmount) }}</span>
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