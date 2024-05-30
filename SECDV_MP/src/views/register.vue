<template>
  <div class="about">
    <div>
      <HelloWorld msg="Welcome" />
      <form @submit.prevent="submitForm">
        <div>
          <label for="fullName">Full Name: </label>
          <input type="text" id="fullName" v-model="fullName" required>
        </div>
        <div>
          <label for="email">Email: </label>
          <input type="email" id="email" v-model="email" @blur="validateEmail" required>
          <span v-if="emailError" class="error-message">{{ emailError }}</span> <!-- Display the error message -->
        </div>
        <div class="password-container">
          <label for="password">Password: </label>
          <input type="password" id="password" v-model="password" @blur="validatePassword" required>
          <span v-if="passwordError" class="error-message">{{ passwordError }}</span> <!-- Display the error message -->
          <div class="tooltip-wrapper">
            <span class="tooltip-icon" @mouseover="showTooltip = true" @mouseout="showTooltip = false">?</span>
            <div v-if="showTooltip" class="tooltip">
              Password must be at least 6 characters long.
              Password must be at least 6 characters long.
            </div>
          </div>
        </div>
        <div>
          <label for="phoneNumber">Phone Number: </label>
          <input type="tel" id="phoneNumber" v-model="phoneNumber" required>
        </div>
        <div>
          <label for="profilePicture">Profile Picture: </label>
          <input type="file" id="profilePicture" accept="image/*" @change="handleFileUpload">
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  </div>
</template>


<style>
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
    display: block; /* Display labels on new lines */
    margin-bottom: 5px; /* Add some space below labels */
  }
  input {
    width: 100%; /* Make inputs fill their container */
    margin-bottom: 10px; /* Add some space below inputs */
  }
  button {
    width: 100%; /* Make button fill its container */
  }
  .password-container {
    position: relative;
    display: flex;
    align-items: center;
  }
  .tooltip-wrapper {
    position: relative;
    display: inline-block;
  }
  .tooltip-icon {
    margin-left: 5px;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f1f1f1;
    font-size: 14px;
    font-weight: bold;
  }
  .tooltip {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: #333;
    color: #fff;
    padding: 5px;
    border-radius: 5px;
    white-space: nowrap;
    transform: translateY(5px);
    z-index: 10;
    font-size: 12px;
  }
  .error-message {
    color: red;
    display: block;
  }
}
</style>



<script>
export default {
  data() {
    return {
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
      profilePicture: null,
      emailError: '',
      passwordError: '',
      phoneError: '',
      showTooltip: false
    };
  },
  methods: {
    submitForm() {
      if (this.validateEmail() && this.validatePassword() && this.validatePhone()) {
        const formData = {
          fullName: this.fullName,
          email: this.email,
          password: this.password,
          phoneNumber: this.phoneNumber,
          profilePicture: this.profilePicture
        };
        console.log(formData);
      }
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      this.profilePicture = file;
    },

    validateEmail() {
      const emailPattern = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/;
      if (!emailPattern.test(this.email)) {
        this.emailError = 'Invalid email address';
        return false;
      }
      this.emailError = '';
      return true;
    },

    validatePassword() {
      const passPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[`~!@#$%^&*\(\)\-\_\=\+\[\]\{\};:\'\"\,\.\<\>\?\/\\|]).{12,64}$/;
      if (!passPattern.test(this.password)) {
        this.passwordError = 'Invalid password';
        return false;
      }
      this.passwordError = '';
      return true;
    },

    validatePhone() {
      const phonePattern = /^09\d{9}$/;
      if (!phonePattern.test(this.phoneNumber)) {
        this.phoneError = 'Invalid phone number';
        return false;
      }
      this.phoneError = '';
      return true;
    }

  }
};
</script>