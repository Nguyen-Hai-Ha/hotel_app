<template>
  <div class="payment-success-page">
    <div class="success-container">
      <div class="success-card">
        <!-- Success Icon -->
        <div class="success-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#10B981"/>
            <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <!-- Success Title -->
        <h1 class="success-title">Thanh toán thành công!</h1>
        <p class="success-subtitle">Cảm ơn bạn đã đặt phòng tại khách sạn của chúng tôi</p>

        <!-- Payment Details -->
        <div class="payment-details">
          <div class="detail-row">
            <span class="detail-label">Mã thanh toán:</span>
            <span class="detail-value payment-code">{{ paymentCode }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Ngày thanh toán:</span>
            <span class="detail-value">{{ paymentDate }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Số tiền:</span>
            <span class="detail-value amount">{{ formatAmount(amount) }}</span>
          </div>
          <div class="detail-row" v-if="bookingId">
            <span class="detail-label">Mã đặt phòng:</span>
            <span class="detail-value">{{ bookingId }}</span>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="info-box">
          <h3>Thông tin quan trọng:</h3>
          <ul>
            <li>Email xác nhận đã được gửi đến địa chỉ email của bạn</li>
            <li>Vui lòng mang theo giấy tờ tùy thân khi nhận phòng</li>
            <li>Liên hệ với chúng tôi nếu bạn cần hỗ trợ thêm</li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn btn-primary" @click="goToHome">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'PaymentSuccess',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // State
    const paymentCode = ref('')
    const paymentDate = ref('')
    const amount = ref(0)
    const bookingId = ref('')
    const status = ref('')
    const message = ref('')

    // Methods
    const formatAmount = (amount) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount)
    }

    const formatDate = (dateString) => {
      if (!dateString) return new Date().toLocaleDateString('vi-VN')
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const goToHome = () => {
      router.push({ name: 'Home' })
    }

    const printReceipt = () => {
      window.print()
    }

    // Initialize data from URL parameters
    onMounted(() => {
      const query = route.query
      
      // Get data from URL parameters
      paymentCode.value = query.vnp_TxnRef || query.paymentCode || 'N/A'
      amount.value = parseFloat(query.vnp_Amount) / 100 || parseFloat(query.amount) || 0
      bookingId.value = query.bookingId || query.vnp_TxnRef || ''
      status.value = query.status || 'success'
      message.value = query.message || 'Thanh toán thành công'
      
      // Set payment date
      if (query.vnp_PayDate) {
        // VNPay date format: YYYYMMDDHHmmss
        const dateStr = query.vnp_PayDate
        const year = dateStr.substring(0, 4)
        const month = dateStr.substring(4, 6)
        const day = dateStr.substring(6, 8)
        const hour = dateStr.substring(8, 10)
        const minute = dateStr.substring(10, 12)
        const second = dateStr.substring(12, 14)
        
        const payDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
        paymentDate.value = formatDate(payDate)
      } else {
        paymentDate.value = formatDate()
      }
    })

    return {
      paymentCode,
      paymentDate,
      amount,
      bookingId,
      status,
      message,
      formatAmount,
      goToHome,
      printReceipt
    }
  }
}
</script>

<style scoped>
.payment-success-page {
  min-height: 100vh;
  background: linear-gradient(100deg, #2a2a2a 0% 0%, #ff6b35 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.success-container {
  width: 100%;
  max-width: 600px;
}

.success-card {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon {
  margin-bottom: 2rem;
  animation: bounceIn 0.8s ease-out 0.2s both;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.success-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  animation: fadeIn 0.6s ease-out 0.4s both;
}

.success-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin-bottom: 2.5rem;
  animation: fadeIn 0.6s ease-out 0.6s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.payment-details {
  background: #f9fafb;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: left;
  animation: fadeIn 0.6s ease-out 0.8s both;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #374151;
}

.detail-value {
  font-weight: 700;
  color: #1f2937;
}

.payment-code {
  font-family: 'Courier New', monospace;
  background: #dbeafe;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #ff6b35;
}

.amount {
  color: #059669;
  font-size: 1.1rem;
}

.info-box {
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
  animation: fadeIn 0.6s ease-out 1s both;
}

.info-box h3 {
  color: #ff6b35;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.info-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-box li {
  padding: 0.5rem 0;
  color: #374151;
  position: relative;
  padding-left: 1.5rem;
}

.info-box li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #059669;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeIn 0.6s ease-out 1.2s both;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(100deg, #2a2a2a 0% 0%, #ff6b35 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: transparent;
  border: 2px solid #667eea;
  color: #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

/* Print styles */
@media print {
  .payment-success-page {
    background: white;
    padding: 0;
  }
  
  .success-card {
    box-shadow: none;
    padding: 2rem;
  }
  
  .action-buttons {
    display: none;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .payment-success-page {
    padding: 1rem;
  }
  
  .success-card {
    padding: 2rem 1.5rem;
  }
  
  .success-title {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
