<template>
  <div class="about">
    <!-- <h1>Registration</h1> -->
    <div>
      <form @submit.prevent="submitForm">
        <div>
          <label for="fullName">Full Name: </label>
          <input type="text" id="fullName" v-model="fullName" required>
        </div>
        <div>
          <label for="email">Email: </label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div>
          <label for="password">Password: </label>
          <input type="password" id="password" v-model="password" required>
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
      profilePicture: null
    };
  },
  methods: {
    submitForm() {
      const formData = {
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        phoneNumber: this.phoneNumber,
        profilePicture: this.profilePicture
      };
      console.log(formData);
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      this.profilePicture = file;
    }
  }
};
</script>