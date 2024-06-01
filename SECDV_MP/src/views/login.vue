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
      </form>
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
    };
  },
  methods: {
    validateAccount(formData) {
      return fetch('http://localhost:3001/api/users/verifyLogin', {
        method: 'POST',
        body: formData
      });
    },

    submitForm() {
      const formData = new FormData();
      formData.append('email', this.email);
      formData.append('password', this.password);

      this.validateAccount(formData)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to Login');
          }
          return response.text(); // Convert bool to string
        }) 
        .then(result => {
          //successful login
          if (result !== 'false') {
            // Redirect to home page with the name
            this.$router.push({ 
              path: '/home',
              query: { name: result } // Pass the name as a query parameter
            });
          } 
          //failed login
          else {
            console.error('Login failed:');
            //--------------------------------------------- add an error message display 
          }
        })
        .catch(error => {
          console.error('Failed to Login', error);
      });
    },
  }
};
</script>

<style scoped>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center; /* Center the form horizontally */
  }
  form {
    width: 300px; /* Adjust the width as needed */
  }
  label {
    display: block; /* Display labels on new lines */
    margin-bottom: 5px; /* Add some space below labels */
  }
  input {
    width: 100%; /* Make inputs fill their container */
    margin-bottom: 10px; /* Add some space below inputs */
  }
  .login-btn {
    width: 100%; /* Make button fill its container */
    background-color: #4CAF50; /* Green background */
    color: white; /* White text */
    padding: 10px 20px; /* Padding */
    border: none; /* Remove border */
    border-radius: 5px; /* Rounded corners */
    cursor: pointer; /* Pointer cursor on hover */
    font-size: 1rem; /* Font size */
  }
  .login-btn:hover {
    background-color: #45a049; /* Darker green on hover */
  }
}
</style>
