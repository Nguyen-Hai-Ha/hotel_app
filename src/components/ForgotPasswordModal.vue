<template>
  <div v-if="isVisible" class="modal" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="close" @click="$emit('close')" aria-label="Close modal">
        <i class="fas fa-times"></i>
      </button>

      <!-- Step 1: Enter Email -->
      <div v-if="currentStep === 'email'">
        <div class="modal-header">
          <h2>Quên mật khẩu?</h2>
          <p>Nhập email của bạn để nhận mã xác thực</p>
        </div>

        <form @submit.prevent="sendVerificationCode" class="forgot-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required placeholder="Nhập email của bạn" />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
            {{ isLoading ? 'Đang gửi...' : 'Gửi mã xác thực' }}
          </button>
        </form>
      </div>

      <!-- Step 2: Enter Verification Code -->
      <div v-if="currentStep === 'verify'">
        <div class="modal-header">
          <h2>Xác thực mã</h2>
          <p>Nhập mã 6 số đã được gửi đến {{ email }}</p>
        </div>

        <form @submit.prevent="verifyCode" class="forgot-form">
          <div class="form-group verification-inputs">
            <input v-for="(digit, index) in verificationCode" :key="index" type="text" maxlength="1"
              v-model="verificationCode[index]" @input="onCodeInput(index, $event)"
              @keydown.delete="handleBackspace(index)" @paste="handlePaste" :ref="el => codeInputs[index] = el" />
          </div>

          <div class="resend-code">
            <p v-if="countdown > 0">
              Gửi lại mã sau {{ Math.floor(countdown / 60) }}:{{ (countdown % 60).toString().padStart(2, '0') }}
            </p>
            <button v-else type="button" class="btn-text" @click="resendCode" :disabled="isLoading">
              Gửi lại mã
            </button>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="isLoading || !isCodeComplete">
            <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
            {{ isLoading ? 'Đang xác thực...' : 'Xác thực' }}
          </button>
        </form>
      </div>

      <!-- Step 3: Reset Password -->
      <div v-if="currentStep === 'reset'">
        <div class="modal-header">
          <h2>Đặt lại mật khẩu</h2>
          <p>Tạo mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <form @submit.prevent="resetPassword" class="forgot-form">
          <div class="form-group">
            <label for="newPassword">Mật khẩu mới</label>
            <div class="password-input">
              <input :type="showPassword ? 'text' : 'password'" id="newPassword" v-model="newPassword" required
                placeholder="Nhập mật khẩu mới" />
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Xác nhận mật khẩu</label>
            <div class="password-input">
              <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword" v-model="confirmPassword"
                required placeholder="Nhập lại mật khẩu mới" />
              <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
            {{ isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu' }}
          </button>
        </form>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="modal-footer">
        <button class="btn-text" @click="$emit('show-login')">
          Quay lại đăng nhập
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ForgotPasswordModal',

  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'show-login'],

  setup(props, { emit }) {
    // State management
    const currentStep = ref('email')
    const email = ref('')
    const verificationCode = ref(['', '', '', '', '', ''])
    const codeInputs = ref([])
    const newPassword = ref('')
    const confirmPassword = ref('')
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const isLoading = ref(false)
    const errorMessage = ref('')
    const countdown = ref(0)

    // Computed properties
    const isCodeComplete = computed(() => {
      return verificationCode.value.every(digit => digit !== '')
    })

    // Timer for resend code countdown
    const startCountdown = () => {
      countdown.value = 180 // 3 minutes = 180 seconds
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value === 0) {
          clearInterval(timer)
          errorMessage.value = 'Mã xác nhận đã hết hạn' // Show expiration message
        }
      }, 1000)
    }

    // Handle verification code input
    const onCodeInput = (index, event) => {
      const input = event.target
      const value = input.value

      // Allow only numbers
      if (!/^\d*$/.test(value)) {
        verificationCode.value[index] = ''
        return
      }

      // Move to next input if available
      if (value && index < 5) {
        codeInputs.value[index + 1]?.focus()
      }
    }

    const handleBackspace = (index) => {
      if (!verificationCode.value[index] && index > 0) {
        verificationCode.value[index - 1] = ''
        codeInputs.value[index - 1]?.focus()
      }
    }

    const handlePaste = (event) => {
      event.preventDefault()
      const pastedText = event.clipboardData.getData('text')
      const numbers = pastedText.replace(/\D/g, '').slice(0, 6)
      numbers.split('').forEach((num, index) => {
        if (index < 6) verificationCode.value[index] = num
      })
    }

    // API calls
    const sendVerificationCode = async () => {
      isLoading.value = true
      errorMessage.value = ''

      try {
        const response = await fetch('http://127.0.0.1:8000/api/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email: email.value })
        })

        const data = await response.json()

        if (response.ok) {
          currentStep.value = 'verify'
          startCountdown()
        } else {
          errorMessage.value = data.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
        }
      } catch (error) {
        console.error('Error:', error)
        errorMessage.value = 'Không thể kết nối đến server. Vui lòng thử lại sau.'
      } finally {
        isLoading.value = false
      }
    }

    const verifyCode = async () => {
      isLoading.value = true
      errorMessage.value = ''

      try {
        const response = await fetch('http://127.0.0.1:8000/api/verify-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: email.value,
            code: verificationCode.value.join('')
          })
        })

        const data = await response.json()

        if (response.ok) {
          currentStep.value = 'reset'
        } else {
          errorMessage.value = data.message || 'Mã xác thực không đúng.'
        }
      } catch (error) {
        console.error('Error:', error)
        errorMessage.value = 'Không thể kết nối đến server. Vui lòng thử lại sau.'
      } finally {
        isLoading.value = false
      }
    }

    const resetPassword = async () => {
      if (newPassword.value !== confirmPassword.value) {
        errorMessage.value = 'Mật khẩu xác nhận không khớp.'
        return
      }

      if (newPassword.value.length < 8) {
        errorMessage.value = 'Mật khẩu phải có ít nhất 8 ký tự.'
        return
      }

      isLoading.value = true
      errorMessage.value = ''

      try {
        const response = await fetch('http://127.0.0.1:8000/api/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: email.value,
            code: verificationCode.value.join(''),
            password: newPassword.value,
            password_confirmation: confirmPassword.value
          })
        })

        const data = await response.json()

        if (response.ok) {
          alert('Đặt lại mật khẩu thành công!')
          emit('show-login')
        } else {
          errorMessage.value = data.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
        }
      } catch (error) {
        console.error('Error:', error)
        errorMessage.value = 'Không thể kết nối đến server. Vui lòng thử lại sau.'
      } finally {
        isLoading.value = false
      }
    }

    const resendCode = async () => {
      if (countdown.value > 0) return
      await sendVerificationCode()
    }

    const closeModal = (event) => {
      if (event.target.classList.contains('modal')) {
        emit('close')
      }
    }

    return {
      currentStep,
      email,
      verificationCode,
      codeInputs,
      newPassword,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      isLoading,
      errorMessage,
      countdown,
      isCodeComplete,
      onCodeInput,
      handleBackspace,
      handlePaste,
      sendVerificationCode,
      verifyCode,
      resetPassword,
      resendCode,
      closeModal
    }
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--vt-c-black-soft);
  border-radius: 12px;
  padding: 2rem;
  max-width: 450px;
  width: 100%;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--booking-blue);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  transition: all 0.3s ease;
}

.close:hover {
  background-color: rgba(255, 107, 53, 0.1);
  transform: rotate(90deg);
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.modal-header h2 {
  color: var(--booking-blue);
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.modal-header p {
  color: #ccc;
  font-size: 1rem;
}

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #eee;
  font-size: 0.95rem;
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 2px solid #ff6b35;
  border-radius: 8px;
  background: var(--vt-c-black-mute);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--booking-blue);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.verification-inputs {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-direction: row;
  margin: 1rem 0;
}

.verification-inputs input {
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  padding: 0;
  border-radius: 8px;
  border: 2px solid #ff6b35;
  background: var(--vt-c-black-mute);
  color: #fff;
  transition: all 0.3s ease;
}

.verification-inputs input:focus {
  outline: none;
  border-color: var(--booking-blue);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 0.25rem;
}

.password-toggle:hover {
  color: var(--booking-blue);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--booking-blue);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--booking-blue-dark);
  transform: translateY(-1px);
}

.btn-text {
  background: none;
  border: none;
  color: var(--booking-blue);
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-text:hover {
  text-decoration: underline;
}

.error-message {
  background: rgba(220, 38, 38, 0.1);
  color: rgb(220, 38, 38);
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-top: 1rem;
  text-align: center;
}

.resend-code {
  text-align: center;
  color: #ccc;
  font-size: 0.9rem;
}

.modal-footer {
  margin-top: 1.5rem;
  text-align: center;
}

@media (max-width: 480px) {
  .modal-content {
    padding: 1.5rem;
  }

  .verification-inputs input {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .btn {
    padding: 0.75rem 1rem;
  }
}
</style>
