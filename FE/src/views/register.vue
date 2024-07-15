<template>
  <div class="about">
    <div>
      <form @submit.prevent="submitForm">

        <div>
          <label for="fullName">Full Name: </label>
          <input type="text" id="fullName" v-model="fullName" @blur="validateName" maxlength="32" required>
          <span v-if="nameError" class="error-message">{{ nameError }}</span>
        </div>

        <div>
          <label for="email">Email: </label>
          <input type="email" id="email" v-model="email" @blur="validateEmail" maxlength="320" autocomplete="off" required>
          <span v-if="emailError" class="error-message">{{ emailError }}</span>
        </div>

        <div>
          <div class="label-tooltip">
            <label for="password">Password: </label>
            <span class="tooltip-icon" @mouseover="showPasswordTooltip = true" @mouseout="showPasswordTooltip = false">?</span>
            <div v-if="showPasswordTooltip" class="tooltip">
              Password must be within 12 and 55 characters and 
              contains at least <br>1 uppercase letter, <br>1 lowercase letter, <br>1 numeric digit, and <br>1 special character <br> (~ ! # $ ^ - _ = +).
            </div>
          </div>
          <div class="password-container">
            <input type="password" id="password" v-model="password" @blur="validatePassword" maxlength="55" autocomplete="off" required>
          </div>
          <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
        </div>

        <div>
          <label for="confirmPassword">Confirm Password: </label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" @blur="validateConfirmPassword" maxlength="55" autocomplete="off" required>
          <span v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</span>
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
            <input type="tel" id="phoneNumber" v-model="phoneNumber" @blur="validatePhone" autocomplete="off" required>
          </div>
          <span v-if="phoneError" class="error-message">{{ phoneError }}</span>
        </div>

        <div>
          <label for="profilePicture">Profile Picture: </label>
          <input type="file" id="profilePicture" accept="image/*" @change="handleFileUpload" required>
          <span v-if="imageError" class="error-message">{{ imageError }}</span>
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
    display: block;
    margin-bottom: 5px;
  }
  .label-tooltip {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    position: relative;
  }
  input {
    width: 100%;
    margin-bottom: 10px;
  }
  button {
    width: 100%;
  }
  .register-button {
    background-color: #419b37;
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
    background-color: #4fc555;
  }

  .password-container,
  .phone-container {
    display: block;
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
    top: 100%;
    left: 50%;
    transform: translate(-50%, 5px); 
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
    margin-top: 5px;
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
      confirmPassword: '',
      phoneNumber: '',
      profilePicture: null,
      nameError: '',
      emailError: '',
      passwordError: '',
      confirmPasswordError: '',
      phoneError: '',
      imageError: '',
      showPasswordTooltip: false,
      showPhoneTooltip: false
    };
  },
  methods: {
    createAccount(formData) {
      return fetch('https://localhost:3001/api/users/saveAccount', {
        method: 'POST',
        body: formData
      });
    },

    submitForm() {
      const isNameValid = this.validateName();
      const isEmailValid = this.validateEmail();
      const isPasswordValid = this.validatePassword();
      const isConfirmPasswordValid = this.validateConfirmPassword();
      const isPhoneValid = this.validatePhone();

      if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !isPhoneValid) {
        return;
      }
      var err = false;
      const formData = new FormData();
      formData.append('name', this.fullName);
      formData.append('email', this.email);
      formData.append('password', this.password);
      formData.append('phoneNumber', this.phoneNumber);
      formData.append('profilePicture', this.profilePicture);

      this.createAccount(formData)
        .then(response => {
          if (response.status === 400) {
            //check if backend returns a specific error message
            return response.json().then(errorData => {
              if (errorData.error) {
                alert('Invalid Input/s');
                err = true;
              }
              else{
                throw new Error('Failed to create account');
              }
            });
          } else if (!response.ok){
            throw new Error('Failed to create account');
          }
          return response.json();
        })
        .then(result => {
          if (!err) {
            this.$router.push('/');
          }
          else{
            err = false;
          }
        })
        .catch(error => {
          console.error('Failed to create account', error);
        });
    },
    
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = (e) => {
          const arr = (new Uint8Array(e.target.result)).subarray(0, 4);
          let header = "";
          for (let i = 0; i < arr.length; i++) {
            header += arr[i].toString(16);
          }

          const fileTypeSignatures = {
            jpeg: "ffd8", // Signature for both .jpg and .jpeg
            png: "89504e47"
          };

          this.profilePicture = file;

          // Not supported file type
          if (!header.startsWith(fileTypeSignatures.jpeg) && !header.startsWith(fileTypeSignatures.png)) {
            this.imageError = 'Invalid file type. Only JPG, JPEG, and PNG are allowed.';
            event.target.value = '';
            this.profilePicture = null;
          } else {
            this.profilePicture = file;
            this.imageError = '';
          }
        };
        reader.readAsArrayBuffer(file);
      }
    },

    validateName() {
      const namePattern = /^[A-Za-z\s]{1,32}$/;
      if (!namePattern.test(this.fullName)) {
        this.nameError = 'Only letters and spaces are allowed';
        return false;
      }
      this.nameError = '';
      return true;
    },

    validateEmail() {
      const emailPattern = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,320})+$/;
      if (!emailPattern.test(this.email)) {
        this.emailError = 'Invalid email address';
        return false;
      }
      this.emailError = '';
      return true;
    },

    validatePassword() {
      const passPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[~!#$^\-\_\=\+]).{12,55}$/;
      if (!passPattern.test(this.password)) {
        this.passwordError = 'Invalid password';
        return false;
      }
      this.passwordError = '';
      return true;
    },

    validateConfirmPassword() {
      if (this.password !== this.confirmPassword) {
        this.confirmPasswordError = 'Passwords do not match';
        return false;
      }
      this.confirmPasswordError = '';
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