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
          <span v-if="emailError" class="error-message">{{ emailError }}</span>
        </div>

        <div>
          <div class="label-tooltip">
            <label for="password">Password: </label>
            <span class="tooltip-icon" @mouseover="showPasswordTooltip = true" @mouseout="showPasswordTooltip = false">?</span>
            <div v-if="showPasswordTooltip" class="tooltip">
              Password must be within 12 and 64 characters and 
              contains at least <br>1 uppercase letter, <br>1 lowercase letter, <br>1 numeric digit, and <br>1 special character.
            </div>
          </div>
          <div class="password-container">
            <input type="password" id="password" v-model="password" @blur="validatePassword" required>
          </div>
          <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
        </div>

        <div>
          <div class="label-tooltip">
            <label for="phoneNumber">Phone Number: </label>
            <span class="tooltip-icon" @mouseover="showPhoneTooltip = true" @mouseout="showPhoneTooltip = false">?</span>
            <div v-if="showPhoneTooltip" class="tooltip">
              Phone number must start with "09" and contain 11 digits or <br>start with "+639" and contain 12 digits.
            </div>
          </div>
          <div class="phone-container">
            <input type="tel" id="phoneNumber" v-model="phoneNumber" @blur="validatePhone" required>
          </div>
          <span v-if="phoneError" class="error-message">{{ phoneError }}</span> <!-- Display the error message -->
        </div>

        <div>
          <label for="profilePicture">Profile Picture: </label>
          <input type="file" id="profilePicture" accept="image/*" @change="handleFileUpload">
        </div>

        <button type="submit" class="register-button">Create Account</button> 
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
  .label-tooltip {
    display: flex;
    align-items: center;
    margin-bottom: 5px; /* Add some space below the label */
    position: relative; /* Needed for absolute positioning of tooltip */
  }
  input {
    width: 100%; /* Make inputs fill their container */
    margin-bottom: 10px; /* Add some space below inputs */
  }
  button {
    width: 100%; /* Make button fill its container */
  }
  .register-button {
    background-color: #419b37; /* Green */
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 10px;
    transition: background-color 0.3s ease;
  }

  .register-button:hover {
    background-color: #4fc555; /* Darker green on hover */
  }

  .password-container,
  .phone-container {
    display: block; /* Ensure the input takes its own line */
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
    color: black;
  }
  .tooltip {
    position: absolute;
    top: 100%; /* Position below the icon */
    left: 50%; /* Center horizontally */
    transform: translate(-50%, 5px); /* Adjust horizontal and vertical positioning */
    background-color: #333;
    color: #fff;
    padding: 5px;
    border-radius: 5px;
    white-space: normal;
    max-width: 300px;
    z-index: 10;
    font-size: 12px;
  }
  .error-message {
    color: #FF5441;
    display: block;
    margin-top: 5px; /* Add some space above the error message */
    font-weight: bold;
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
      showPasswordTooltip: false,
      showPhoneTooltip: false
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
      const phonePattern1 = /^09\d{9}$/;
      const phonePattern2 = /^\+639\d{9}$/;
      if (!phonePattern1.test(this.phoneNumber) && !phonePattern2.test(this.phoneNumber)) {
        this.phoneError = 'Invalid phone number';
        return false;
      }
      this.phoneError = '';
      return true;
    }
  }
};
</script>
