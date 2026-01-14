<template>
  <div class="qr-payment-page">
    <div class="container">
      <div class="header">
        <h1>Thanh toán đặt cọc qua mã QR</h1>
        <p>Vui lòng quét mã QR bên dưới để hoàn tất thanh toán đặt cọc</p>
      </div>
      
      <div class="qr-container">
        <div class="qr-code-wrapper">
          <!-- We'll use a placeholder for now, but in a real app this would be a real QR code -->
          <div class="qr-placeholder">
            <div class="qr-code" id="qrcode"></div>
            <p>Mã QR thanh toán đặt cọc</p>
          </div>
        </div>
        
        <div class="payment-info">
          <h2>Thông tin thanh toán</h2>
          <div class="info-item">
            <span>Số tiền:</span>
            <span class="amount">{{ money(totalAmount) }}</span>
          </div>
          <div class="info-item">
            <span>Mã đặt phòng:</span>
            <span class="booking-id">{{ bookingId }}</span>
          </div>
          <div class="info-item">
            <span>Thời hạn thanh toán:</span>
            <span class="deadline">{{ paymentDeadline }}</span>
          </div>
        </div>
      </div>
      
      <div class="actions">
        <button class="btn btn-primary" @click="refreshQR">Hoàn Tất Đặt Cọc</button>
      </div>
      
      <div class="status-message" v-if="paymentStatus === 'completed'">
        <div class="success-icon">✓</div>
        <h3>Thanh toán thành công!</h3>
        <p>Chúng tôi đã xác nhận thanh toán đặt cọc của bạn.</p>
        <router-link :to="{ name: 'Home' }" class="btn btn-primary">Quay về trang chủ</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'QRPaymentView',
  data() {
    return {
      bookingId: 'BK00123456789',
      totalAmount: 500000,
      paymentDeadline: '24 giờ từ bây giờ',
      paymentStatus: 'pending' // pending, completed
    }
  },
  mounted() {
    this.generateQRCode()
  },
  methods: {
    money(amount) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    },
    async generateQRCode() {
      try {
        const qrCodeElement = document.getElementById('qrcode')
        if (qrCodeElement) {
          // Generate QR code for payment information
          const qrData = `payment:bookingId=${this.bookingId}&amount=${this.totalAmount}`
          await QRCode.toCanvas(qrCodeElement, qrData, { width: 200 }, function (error) {
            if (error) console.error(error)
          })
        }
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    },
    refreshQR() {
      this.generateQRCode()
    },
    closePage() {
      // Close the current window/tab
      window.close()
    }
  }
}
</script>

<style scoped>
.qr-payment-page {
  background-color: #1f1f1f;
  padding: 1rem;
  padding-top: 6.5rem;
  min-height: 100vh;
  color: #f3f4f6;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

.header p {
  color: #cbd5e1;
  font-size: 1.1rem;
}

.qr-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.qr-code-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #3a3a3a;
}

.qr-placeholder {
  text-align: center;
}

.qr-code {
  margin: 0 auto 1rem;
  border: 1px solid #3a3a3a;
  padding: 0.5rem;
  background: white;
  display: inline-block;
}

.payment-info {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #3a3a3a;
}

.payment-info h2 {
  color: #ffffff;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #3a3a3a;
}

.info-item:last-child {
  border-bottom: none;
}

.amount {
  color: #4ade80;
  font-weight: bold;
  font-size: 1.2rem;
}

.booking-id {
  color: #60a5fa;
  font-weight: bold;
}

.deadline {
  color: #fbbf24;
  font-weight: bold;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid transparent;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  border-color: #3a3a3a;
  color: #e5e7eb;
}

.btn-outline:hover {
  background: #2a2a2a;
  transform: translateY(-2px);
}

.status-message {
  text-align: center;
  padding: 2rem;
  background: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #3a3a3a;
}

.success-icon {
  font-size: 4rem;
  color: #4ade80;
  margin-bottom: 1rem;
}

.status-message h3 {
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.status-message p {
  color: #cbd5e1;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .qr-container {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .qr-code-wrapper {
    flex: 1;
  }
  
  .payment-info {
    flex: 1;
  }
}
</style>
