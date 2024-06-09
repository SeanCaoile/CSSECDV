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
      errorMessage: ''
    };
  },
  methods: {
    async validateAccount(formData) {
      const response = await fetch('http://localhost:3001/api/users/verifyLogin', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      return response.json().then(data => ({ status: response.status, data }));
    },

    async executeRecaptcha() {
      return new Promise((resolve, reject) => {
        if (typeof grecaptcha !== 'undefined') {
          grecaptcha.enterprise.ready(async () => {
            try {
              const token = await grecaptcha.enterprise.execute('6Le05_MpAAAAAHnLZHNRGhOl66j8oVP52nI6Zq3h', { action: 'login' });
              resolve(token);
            } catch (error) {
              reject(error);
            }
          });
        } else {
          reject(new Error('reCAPTCHA not loaded'));
        }
      });
    },

    async submitForm() {
      try {
        const formData = new FormData();
        formData.append('email', this.email);
        formData.append('password', this.password);

        const { status, data } = await this.validateAccount(formData);

        if (status === 200) {
          const captchaToken = await this.executeRecaptcha();
          // Handle successful login here, for example, by redirecting the user:
          this.$router.push({
            path: '/home',
            query: { name: data.name, isAdmin: data.isAdmin }
          });
        } else {
          this.errorMessage = data.message;
        }
      } catch (error) {
        console.error('Failed to login', error);
        this.errorMessage = 'Failed to login. Please try again.';
      }
    },
  },
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/enterprise.js?render=6Le05_MpAAAAAHnLZHNRGhOl66j8oVP52nI6Zq3h';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      grecaptcha.enterprise.ready(() => {
        console.log('reCAPTCHA loaded');
      });
    };
    script.onerror = () => {
      console.error('Failed to load reCAPTCHA');
    };
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
