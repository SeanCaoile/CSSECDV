<template>
  <div class="about">
    <div>
      <form @submit.prevent="submitForm">
        <div>
          <label for="email">Email: </label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div>
          <label for="password">Password: </label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit" class="login-btn">Login</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="lockoutMessage" class="error-message">{{ lockoutMessage }}</p>
      </form>
      <!-- reCAPTCHA container -->
      <div id="recaptcha-container"></div>
    </div>
  </div>
</template>

<script>
import { resetAppStyles } from '../utils/stylesUtils';

export default {
  beforeRouteEnter(to, from, next) {
    next(vm => {
      resetAppStyles();
    });
  },

  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      lockoutMessage: '',
    };
  },
  computed: {
    isAdminComputed() {
      return this.isAdmin;
    },
  },
  methods: {
    async validateAccount(formData) {
      return await fetch('http://localhost:3001/api/users/verifyLogin', {
        method: 'POST',
        body: formData
      });
    },

    async executeRecaptcha() {
      return new Promise(resolve => {
        grecaptcha.enterprise.ready(async () => {
          const token = await grecaptcha.enterprise.execute('6Le05_MpAAAAAHnLZHNRGhOl66j8oVP52nI6Zq3h', { action: 'login' });
          resolve(token);
        });
      });
    },

    async submitForm() {
      try {
        const formData = new FormData();
        formData.append('email', this.email);
        formData.append('password', this.password);

        const response = await this.validateAccount(formData);

        if (!response.ok) {
          throw new Error('Failed to Login');
        }

        const result = await response.json();

        if (result !== 'false') {
          const captchaToken = await this.executeRecaptcha();
          // Send captchaToken and login details to your backend for verification
          // Example: await this.sendLoginData(captchaToken, result.name, result.isAdmin);

          // Redirect to home page with the name
          this.$router.push({ 
            path: '/home',
            query: { name: result.name, isAdmin: result.isAdmin }
          });
        } else {
          this.errorMessage = 'Invalid email or password';
          this.lockoutMessage = '';
        }
      } catch (error) {
        console.error('Failed to Login', error);
        this.errorMessage = 'Failed to login. Please try again.';
        this.lockoutMessage = '';
      }
    },
  },
  mounted() {
    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/enterprise.js?render=6Le05_MpAAAAAHnLZHNRGhOl66j8oVP52nI6Zq3h';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
};
</script>

<style scoped>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  form {
    width: 300px;
  }
  label {
    display: block;
    margin-bottom: 5px;
  }
  input {
    width: 100%;
    margin-bottom: 10px;
  }
  .login-btn {
    width: 100%;
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
  }
  .login-btn:hover {
    background-color: #45a049;
  }
}
.error-message {
  color: red;
  margin-top: 5px;
}
</style>