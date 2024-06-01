<template>
  <div>
    <nav class="navbar">
      <button class="logout-btn" @click="logout">Logout</button>
    </nav>
    <div class="centered">
      <h1>Welcome: {{ name }}</h1>
    <!-- <div class="about"> -->
      <!-- <h1>Home</h1> -->
    </div>
  </div>
</template>

<script>
import { resetAppStyles, setAppStylesForHome } from '../utils/stylesUtils';

export default {
  data() {
    return {
      name: ''
    };
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (window.innerWidth > 1024) {
        setAppStylesForHome();
      }
    });
  },
  
  beforeRouteLeave(to, from, next) {
    resetAppStyles();
    next();
  },

  mounted() {
    // Retrieve the name from the query parameters
    this.name = this.$route.query.name;
  },

  methods: {
    logout() {
      this.$router.push('/');
    }
  }
};

</script>


<!-- <style>
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
  button {
    width: 100%; /* Make button fill its container */
  }
}
</script> -->

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 6rem; /* Increased height */
  display: flex;
  justify-content: flex-end; /* Align logout button to the end */
  align-items: center;
  padding: 1rem 2rem; /* Adjusted padding */
  background-color: #333;
  color: white;
}

.logout-btn {
  background-color: #b23b3b;
  color: white;
  border: none;
  cursor: pointer;
  padding: 0.8rem 1.5rem; /* Adjusted padding */
  border-radius: 50px; /* Make button oval-shaped */
  font-size: 1.1rem; /* Adjust font size */
  margin-left: auto; /* Move button to the right */
  width: 130px;
}

.logout-btn:hover {
  text-decoration: underline;
}

.centered {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 6rem); /* Full height minus navbar */
  text-align: center;
}

h1 {
  font-size: 2rem; /* Adjusted font size */
  color: #333;
}
</style>