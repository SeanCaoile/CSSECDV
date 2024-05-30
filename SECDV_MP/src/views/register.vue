<template>
  <div class="about">
    <!-- <h1>Registration</h1> -->
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
          <span v-if="emailError" style="color: red; font-family: Arial, Helvetica, sans-serif; font-weight: bold;">{{ emailError }}</span>
        </div>
        <div>
          <label for="password">Password: </label>
          <input type="password" id="password" v-model="password" @blur="validatePassword" required>
          <span v-if="passwordError" style="color: red; font-family: Arial, Helvetica, sans-serif; font-weight: bold;">{{ passwordError }}</span>
        </div>
        <div>
          <label for="phoneNumber">Phone Number: </label>
          <input type="tel" id="phoneNumber" v-model="phoneNumber" @blur="validatePhone" required>
          <span v-if="phoneError" style="color: red; font-family: Arial, Helvetica, sans-serif; font-weight: bold;">{{ phoneError }}</span>
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
      phoneError: ''
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