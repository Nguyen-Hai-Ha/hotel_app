<template>
  <div v-if="isVisible" class="modal" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="close" @click="$emit('close')" aria-label="Close">×</button>

      <div class="modal-header">
        <h2>{{ $t('auth.welcome') }}</h2>
        <p>{{ $t('auth.signIn') }}</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">{{ $t('auth.email') }}</label>
          <input type="email" id="email" v-model="email" required :placeholder="$t('auth.email')"
            autocomplete="email" />
        </div>

        <div class="form-group">
          <label for="password">{{ $t('auth.password') }}</label>
          <div class="password-input">
            <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" required
              :placeholder="$t('auth.password')" autocomplete="current-password" />
            <button type="button" class="password-toggle" @click="togglePassword"
              aria-label="Toggle password visibility">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="rememberMe" />
            <span class="checkmark"></span>
            {{ $t('auth.rememberMe') }}
          </label>
          <a href="#" class="forgot-password" @click.prevent="showForgotPassword">{{ $t('auth.forgotPassword') }}</a>
        </div>

        <div class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn btn-orange login-btn" :disabled="isLoading">
          <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
          {{ isLoading ? $t('common.loading') : $t('auth.loginButton') }}
        </button>

        <div class="signup-link">
          <p>{{ $t('auth.dontHaveAccount') }} <a href="#" @click.prevent="showSignup">{{ $t('auth.signupButton') }}</a>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { apiUrl } from '@/environment';

export default {
  name: 'LoginModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'show-signup', 'show-forgot-password'],
  setup(props, { emit }) {
    const email = ref('');
    const password = ref('');
    const rememberMe = ref(false);
    const showPassword = ref(false);
    const isLoading = ref(false);
    const errorMessage = ref('');

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    const handleLogin = async () => {
      isLoading.value = true;
      errorMessage.value = '';

      try {
        const response = await fetch(`${apiUrl}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.value,
            password: password.value,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store token in localStorage
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          // Dispatch custom event to trigger header refresh
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'auth_token',
            newValue: data.token
          }));

          if (data.user.id_role === 2) {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/admin';
          } else {
            // Close modal and show success message
            emit('close');
            alert($t('auth.loginSuccess'));
          }

          // Reset form
          email.value = '';
          password.value = '';
          rememberMe.value = false;

          // Check for pending booking after successful login
          const pendingBooking = localStorage.getItem('pendingBooking');

          if (pendingBooking) {
            const { roomId, timestamp } = JSON.parse(pendingBooking);
            const now = new Date().getTime();
            const fiveMinutes = 5 * 60 * 1000;

            if (now - timestamp < fiveMinutes) {
              window.location.href = `/room/${roomId}`;
            } else {
              localStorage.removeItem('pendingBooking');
            }
          }
        } else {
          errorMessage.value = data.message || $t('auth.loginFailed');
        }
      } catch (error) {
        console.error('Login error:', error);
        errorMessage.value = $t('auth.errorOccurred');
      } finally {
        isLoading.value = false;
      }
    };

    const closeModal = (event) => {
      if (event.target.classList.contains('modal')) {
        event.target.dispatchEvent(new CustomEvent('close'));
      }
    };

    const showSignup = () => {
      emit('show-signup');
    };

    const showForgotPassword = () => {
      emit('show-forgot-password');
    };

    return {
      email,
      password,
      rememberMe,
      showPassword,
      isLoading,
      errorMessage,
      togglePassword,
      handleLogin,
      closeModal,
      showSignup,
      showForgotPassword
    };
  }
};
</script>

<style scoped>
.modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background-color: #282828;
  padding: 40px;
  border-radius: 15px;
  width: 100%;
  max-width: 450px;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  max-height: 90vh;
  overflow-y: auto;
}

.close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--booking-blue);
  transition: transform 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close:hover {
  transform: rotate(90deg);
  background-color: rgba(255, 107, 53, 0.1);
}

.modal-header {
  text-align: center;
  margin-bottom: 30px;
}

.modal-header h2 {
  color: var(--booking-blue);
  margin-bottom: 10px;
  font-size: 2rem;
}

.modal-header p {
  color: #ccc;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #eee;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-group input {
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #ff6b35;
  background-color: var(--vt-c-black-mute);
  color: #fff;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--booking-blue);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 5px;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: var(--booking-blue);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
  font-size: 0.9rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--booking-blue);
}

.forgot-password {
  color: var(--booking-blue);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: var(--booking-blue-dark);
}

.login-btn {
  width: 100%;
  padding: 15px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.signup-link {
  text-align: center;
  margin-top: 20px;
}

.signup-link p {
  color: #ccc;
  font-size: 0.95rem;
}

.signup-link a {
  color: var(--booking-blue);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.signup-link a:hover {
  color: var(--booking-blue-dark);
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .modal {
    padding: 10px;
    align-items: flex-end;
  }

  .modal-content {
    padding: 30px 25px;
    max-height: 95vh;
    border-radius: 20px 20px 0 0;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }

    to {
      transform: translateY(0);
    }
  }

  .modal-header {
    margin-bottom: 25px;
  }

  .modal-header h2 {
    font-size: 1.8rem;
  }

  .modal-header p {
    font-size: 0.95rem;
  }

  .form-group {
    gap: 6px;
  }

  .form-group label {
    font-size: 0.9rem;
  }

  .form-group input {
    padding: 14px;
    font-size: 1rem;
    border-width: 1px;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .login-btn {
    padding: 13px;
    font-size: 1rem;
  }

  .checkbox-label,
  .forgot-password {
    font-size: 0.85rem;
  }

  .signup-link p {
    font-size: 0.9rem;
  }

  .signup-link a {
    display: block;
    margin-top: 5px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 25px 20px;
    border-radius: 15px 15px 0 0;
  }

  .modal-header h2 {
    font-size: 1.6rem;
  }

  .modal-header p {
    font-size: 0.9rem;
  }

  .form-group input {
    padding: 12px;
    font-size: 0.95rem;
  }

  .form-group label {
    font-size: 0.85rem;
  }

  .login-btn {
    padding: 13px;
    font-size: 1rem;
  }

  .checkbox-label,
  .forgot-password {
    font-size: 0.85rem;
  }

  .signup-link p {
    font-size: 0.9rem;
  }

  .signup-link a {
    display: block;
    margin-top: 5px;
  }
}
</style>
