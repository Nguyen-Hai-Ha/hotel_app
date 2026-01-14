<template>
  <div class="admin-login-page">
    <!-- Background Elements -->
    <div class="background-elements">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
      <div class="floating-icons">
        <i class="fas fa-hotel icon-1"></i>
        <i class="fas fa-key icon-2"></i>
        <i class="fas fa-shield-alt icon-3"></i>
        <i class="fas fa-cog icon-4"></i>
      </div>
    </div>

    <!-- Main Content -->
    <div class="login-content">
      <div class="login-section">
        <div class="login-card">
          <div class="card-header">
            <h2>Đăng nhập Admin</h2>
            <p>Vui lòng nhập thông tin đăng nhập</p>
          </div>

          <div class="login-form-container">
            <form @submit.prevent="handleLogin" class="login-form">
              <div class="form-group">
                <label for="username">
                  <i class="fas fa-user"></i>
                  Email
                </label>
                <input type="email" id="username" v-model="loginForm.email" placeholder="Nhập email" required
                  :disabled="isLoading" />
              </div>

              <div class="form-group">
                <label for="password">
                  <i class="fas fa-lock"></i>
                  Mật khẩu
                </label>
                <div class="password-input">
                  <input :type="showPassword ? 'text' : 'password'" id="password" v-model="loginForm.password"
                    placeholder="Nhập mật khẩu" required :disabled="isLoading" />
                  <button type="button" class="toggle-password" @click="togglePassword" :disabled="isLoading">
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="loginForm.rememberMe" :disabled="isLoading" />
                  <span class="checkmark"></span>
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div class="form-actions">
                <button type="submit" class="login-btn" :disabled="isLoading || !isFormValid">
                  <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-sign-in-alt"></i>
                  {{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
                </button>
              </div>

              <div class="forgot-password">
                <a href="#" @click.prevent="showForgotPassword">
                  Quên mật khẩu?
                </a>
              </div>
            </form>

            <!-- Error Message -->
            <div v-if="errorMessage" class="error-message">
              <i class="fas fa-exclamation-triangle"></i>
              {{ errorMessage }}
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="success-message">
              <i class="fas fa-check-circle"></i>
              {{ successMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotModal" class="forgot-modal">
      <div class="modal-overlay" @click="closeForgotModal"></div>
      <div class="forgot-content">
        <h3>Khôi phục mật khẩu</h3>
        <p>Nhập email để nhận liên kết khôi phục mật khẩu</p>
        <input type="email" v-model="forgotEmail" placeholder="Nhập email của bạn" class="forgot-input" />
        <div class="forgot-actions">
          <button @click="sendResetEmail" class="btn-primary">
            Gửi liên kết
          </button>
          <button @click="closeForgotModal" class="btn-secondary">
            Hủy
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'LoginAdmin',
  data() {
    return {
      loginForm: {
        email: '',
        password: '',
        rememberMe: false
      },
      showPassword: false,
      isLoading: false,
      errorMessage: '',
      successMessage: '',
      showForgotModal: false,
      forgotEmail: ''
    }
  },
  computed: {
    isFormValid() {
      return this.loginForm.email.trim() && this.loginForm.password.trim()
    }
  },
  methods: {
    async handleLogin() {
      if (!this.isFormValid) return

      this.isLoading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const response = await axios.post('https://api.thesecret-hotel.com/api/admin/login', {
          email: this.loginForm.email,
          password: this.loginForm.password,
        })

        if (response.data.success) {
          this.successMessage = 'Đăng nhập thành công!'

          // Store admin token
          const token = response.data.token
          const adminData = response.data.admin

          localStorage.setItem('admin_token', token)
          localStorage.setItem('admin_data', JSON.stringify(adminData))

          // Debug logging
          console.log('Admin data saved:', adminData)
          console.log('Admin id_role:', adminData.id_role)

          // Redirect to admin dashboard after successful login
          setTimeout(() => {
            this.$router.push('/admin')
          }, 1000)
        }
      } catch (error) {
        console.error('Login error:', error)

        if (error.response?.data?.message) {
          this.errorMessage = error.response.data.message
        } else if (error.response?.status === 401) {
          this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng'
        } else if (error.response?.status === 403) {
          this.errorMessage = 'Tài khoản không có quyền truy cập'
        } else {
          this.errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.'
        }
      } finally {
        this.isLoading = false
      }
    },

    togglePassword() {
      this.showPassword = !this.showPassword
    },

    closeLogin() {
      this.resetForm()
      // Redirect to home page instead of emitting close event
      this.$router.push('/')
    },

    resetForm() {
      this.loginForm = {
        email: '',
        password: '',
        rememberMe: false
      }
      this.showPassword = false
      this.errorMessage = ''
      this.successMessage = ''
      this.isLoading = false
    },

    showForgotPassword() {
      this.showForgotModal = true
      this.forgotEmail = ''
    },

    closeForgotModal() {
      this.showForgotModal = false
      this.forgotEmail = ''
    },

    async sendResetEmail() {
      if (!this.forgotEmail) {
        alert('Vui lòng nhập email')
        return
      }

      try {
        await axios.post('https://api.thesecret-hotel.com/api/admin/forgot-password', {
          email: this.forgotEmail
        })

        alert('Liên kết khôi phục đã được gửi đến email của bạn')
        this.closeForgotModal()
      } catch (error) {
        alert('Có lỗi xảy ra. Vui lòng thử lại sau.')
      }
    }
  },

  mounted() {
    // Check if admin is already logged in
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (token) {
      // Redirect to admin dashboard if already logged in
      this.$router.push('/admin')
    }
  }
}
</script>

<style scoped>
/* Reset and Base Styles - Scoped to admin login page */
.admin-login-page * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Main container - completely independent */
.admin-login-page {
  min-height: 100vh !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
  z-index: 9999 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  outline: none !important;
  box-sizing: border-box !important;
  display: block !important;
}

/* Background Elements */
.background-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation-delay: 2s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: -75px;
  animation-delay: 4s;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.floating-icons {
  position: absolute;
  width: 100%;
  height: 100%;
}

.floating-icons i {
  position: absolute;
  color: rgba(255, 255, 255, 0.1);
  font-size: 24px;
  animation: floatIcon 8s ease-in-out infinite;
}

.icon-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.icon-2 {
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.icon-3 {
  bottom: 30%;
  left: 20%;
  animation-delay: 4s;
}

.icon-4 {
  top: 40%;
  right: 30%;
  animation-delay: 6s;
}

@keyframes floatIcon {

  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.1;
  }

  50% {
    transform: translateY(-30px) scale(1.1);
    opacity: 0.2;
  }
}

/* Main Content */
.login-content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  align-items: center;
  padding: 20px;
  gap: 40px;
}

/* Branding Section */
.branding-section {
  flex: 1;
  max-width: 500px;
  color: white;
  padding: 40px;
}

.brand-logo {
  text-align: center;
  margin-bottom: 60px;
}

.logo-circle {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.logo-circle i {
  font-size: 48px;
  color: white;
}

.brand-logo h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.brand-logo p {
  font-size: 18px;
  opacity: 0.9;
  font-weight: 300;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 60px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(10px);
}

.feature-item i {
  font-size: 20px;
  color: #ffd700;
  width: 24px;
}

.feature-item span {
  font-size: 16px;
  font-weight: 500;
}

.back-to-site {
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.back-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* Login Section */
.login-section {
  flex: 0 0 450px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 450px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.card-header {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  padding: 30px;
  text-align: center;
}

.card-header h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.card-header p {
  font-size: 16px;
  opacity: 0.9;
  font-weight: 300;
}

.login-form-container {
  padding: 40px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.form-group label i {
  color: #ff6b35;
  width: 18px;
  font-size: 16px;
}

.form-group input {
  padding: 15px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f8fafc;
  font-family: inherit;
  color: #333;
}

.form-group input:focus {
  outline: none;
  border-color: #ff6b35;
  background: white;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.1);
  transform: translateY(-1px);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s;
}

.toggle-password:hover {
  color: #ff6b35;
  background: rgba(255, 107, 53, 0.1);
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 500;
  color: #475569;
  font-size: 15px;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e0;
  border-radius: 6px;
  position: relative;
  transition: all 0.3s ease;
  background: white;
}

.checkbox-label input[type="checkbox"]:checked+.checkmark {
  background: #ff6b35;
  border-color: #ff6b35;
  transform: scale(1.1);
}

.checkbox-label input[type="checkbox"]:checked+.checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.login-btn {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(255, 107, 53, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.forgot-password {
  text-align: center;
  margin-top: 20px;
}

.forgot-password a {
  color: #ff6b35;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  padding: 5px 10px;
  border-radius: 6px;
}

.forgot-password a:hover {
  color: #e55a2b;
  background: rgba(255, 107, 53, 0.1);
}

.error-message,
.success-message {
  padding: 15px 18px;
  border-radius: 12px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.success-message {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

/* Forgot Password Modal */
.forgot-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
}

.forgot-content {
  background: white;
  padding: 40px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  position: relative;
  z-index: 1001;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}

.forgot-content h3 {
  margin: 0 0 15px 0;
  color: #1e293b;
  font-size: 24px;
  font-weight: 700;
}

.forgot-content p {
  margin: 0 0 25px 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.5;
}

.forgot-input {
  width: 100%;
  padding: 15px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 25px;
  box-sizing: border-box;
  font-size: 16px;
  transition: all 0.3s;
}

.forgot-input:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.1);
}

.forgot-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .login-content {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }

  .branding-section {
    max-width: none;
    padding: 20px;
  }

  .brand-logo h1 {
    font-size: 36px;
  }

  .login-section {
    flex: none;
  }
}

@media (max-width: 768px) {
  .admin-login-page {
    padding: 0;
    overflow-y: auto;
  }

  .login-content {
    min-height: 100vh;
    padding: 10px;
  }

  .branding-section {
    display: none;
  }

  .login-card {
    max-width: 100%;
  }

  .card-header {
    padding: 25px 20px;
  }

  .card-header h2 {
    font-size: 24px;
  }

  .login-form-container {
    padding: 30px 25px;
  }
}

@media (max-width: 480px) {
  .login-form-container {
    padding: 25px 20px;
  }

  .form-group input {
    padding: 12px 15px;
    font-size: 16px;
  }

  .login-btn {
    padding: 14px 20px;
  }

  .forgot-content {
    padding: 30px 25px;
    margin: 20px;
  }
}
</style>