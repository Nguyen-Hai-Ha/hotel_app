<template>
  <div v-if="isVisible" class="modal" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="close" @click="$emit('close')" aria-label="Close modal">
        X
      </button>

      <div class="modal-header">
        <h2>Create Account</h2>
        <p>Join us and start your journey with The Secret Hotel</p>
      </div>

      <form class="signup-form" @submit.prevent="handleSignup">
        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" id="username" v-model="username" required placeholder="Enter your username"
            autocomplete="username" />
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" v-model="email" required placeholder="Enter your email" autocomplete="email" />
        </div>

        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input type="tel" id="phone" v-model="phone" placeholder="Enter your phone number" autocomplete="tel" />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input">
            <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" required
              placeholder="Create a password" autocomplete="new-password" />
            <button type="button" class="password-toggle" @click="togglePassword"
              aria-label="Toggle password visibility">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="password-input">
            <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword" v-model="confirmPassword"
              required placeholder="Confirm your password" autocomplete="new-password" />
            <button type="button" class="password-toggle" @click="toggleConfirmPassword"
              aria-label="Toggle password visibility">
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>


        <div class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn btn-orange signup-btn" :disabled="isLoading">
          <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>

        <!-- <div class="divider">
          <span>or</span>
        </div>

        <div class="social-signup">
          <button type="button" class="btn btn-social btn-google">
            <i class="fab fa-google"></i>
            Sign up with Google
          </button>
          <button type="button" class="btn btn-social btn-facebook">
            <i class="fab fa-facebook-f"></i>
            Sign up with Facebook
          </button>
        </div> -->

        <div class="login-link">
          <p>Already have an account? <a href="#" @click.prevent="showLogin">Sign in</a></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { apiUrl } from '@/environment';

export default {
  name: 'SignUpModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'show-login'],
  setup(props, { emit }) {
    const username = ref('');
    const email = ref('');
    const phone = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const agreeTerms = ref(false);
    const newsletter = ref(false);
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const isLoading = ref(false);
    const errorMessage = ref('');

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    const toggleConfirmPassword = () => {
      showConfirmPassword.value = !showConfirmPassword.value;
    };

    const validateForm = () => {
      if (password.value !== confirmPassword.value) {
        errorMessage.value = 'Passwords do not match';
        return false;
      }
      if (password.value.length < 8) {
        errorMessage.value = 'Password must be at least 8 characters long';
        return false;
      }
      errorMessage.value = '';
      return true;
    };

    const handleSignup = async () => {
      if (!validateForm()) return;

      isLoading.value = true;
      errorMessage.value = '';

      try {
        const response = await fetch(`${apiUrl}/api/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            username: username.value,
            email: email.value,
            password: password.value,
            phone: phone.value
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Close modal and show success message
          emit('close');
          alert('Account created successfully!');

          // Reset form
          resetForm();
        } else {
          errorMessage.value = data.message || 'Registration failed. Please try again.';
        }
      } catch (error) {
        console.error('Signup error:', error);
        errorMessage.value = 'An error occurred. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };

    const resetForm = () => {
      username.value = '';
      email.value = '';
      phone.value = '';
      password.value = '';
      confirmPassword.value = '';
      agreeTerms.value = false;
      newsletter.value = false;
      errorMessage.value = '';
    };

    const closeModal = (event) => {
      if (event.target.classList.contains('modal')) {
        event.target.dispatchEvent(new CustomEvent('close'));
      }
    };

    const showLogin = () => {
      emit('close');
      emit('show-login');
    };

    return {
      username,
      email,
      phone,
      password,
      confirmPassword,
      agreeTerms,
      newsletter,
      showPassword,
      showConfirmPassword,
      isLoading,
      errorMessage,
      togglePassword,
      toggleConfirmPassword,
      handleSignup,
      closeModal,
      showLogin
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
  max-width: 500px;
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

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
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
  flex-direction: column;
  gap: 15px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #ccc;
  font-size: 0.9rem;
  cursor: pointer;
  line-height: 1.4;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--booking-blue);
  margin-top: 2px;
}

.terms-link {
  color: var(--booking-blue);
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: var(--booking-blue-dark);
}

.error-message {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(220, 53, 69, 0.3);
  font-size: 0.9rem;
}

.signup-btn {
  width: 100%;
  padding: 15px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.signup-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider {
  text-align: center;
  position: relative;
  margin: 20px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #ff6b35;
}

.divider span {
  background-color: var(--vt-c-black-soft);
  padding: 0 15px;
  color: #ccc;
  font-size: 0.9rem;
}

.social-signup {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border: 2px solid #ff6b35;
  background-color: transparent;
  color: #ccc;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-social:hover {
  border-color: var(--booking-blue);
  color: var(--booking-blue);
  transform: translateY(-2px);
}

.btn-google:hover {
  background-color: rgba(255, 107, 53, 0.1);
}

.btn-facebook:hover {
  background-color: rgba(255, 107, 53, 0.1);
}

.login-link {
  text-align: center;
  margin-top: 20px;
}

.login-link p {
  color: #ccc;
  font-size: 0.95rem;
}

.login-link a {
  color: var(--booking-blue);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.login-link a:hover {
  color: var(--booking-blue-dark);
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .modal {
    padding: 10px;
  }

  .modal-content {
    padding: 30px 25px;
    max-height: 95vh;
  }

  .modal-header h2 {
    font-size: 1.8rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .form-options {
    gap: 12px;
  }

  .checkbox-label {
    font-size: 0.85rem;
  }

  .social-signup {
    gap: 12px;
  }

  .btn-social {
    padding: 15px;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 25px 20px;
  }

  .modal-header h2 {
    font-size: 1.6rem;
  }

  .form-group input {
    padding: 12px;
    font-size: 0.95rem;
  }

  .signup-btn {
    padding: 12px;
    font-size: 1rem;
  }
}
</style>
