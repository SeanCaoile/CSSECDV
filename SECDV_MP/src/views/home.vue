<template>
  <div>
    <nav class="navbar">
      <button class="logout-btn" @click="logout">Logout</button>
    </nav>
    <div class="centered">
      <h1>Welcome "ACCOUNT_NAME"</h1>
    </div>
  </div>
</template>

<script>
import { resetAppStyles, setAppStylesForHome } from '../utils/stylesUtils';

export default {
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
  
  methods: {
    logout() {
      this.$router.push('/');
    }
  }
}
</script>

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