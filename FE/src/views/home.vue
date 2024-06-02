<template>
  <div>
    <nav class="navbar">
      <div class="left-buttons">
        <button v-if="isAdmin" class="new-page-btn" @click="adminView">Admin Page</button>
      </div>
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
      name: '',
      isAdmin: null // Add userId to the data object
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
    // Retrieve the name and userId from the query parameters
    this.name = this.$route.query.name;
    this.isAdmin = parseInt(this.$route.query.isAdmin, 10); // Retrieve and convert userId to a number
  },

  computed: {
    isAdmin() {
      return this.isAdmin === 1; // Check if userId is 0
    }
  },

  methods: {
    adminView() {
      // this.$router.push('/admin'); // Adjust the path as needed
      this.$router.push({ 
        path: '/admin',
        query: { name: this.name, isAdmin: this.isAdmin } // Pass the name as a query parameter
      });
    },
    logout() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 6rem; /* Increased height */
  display: flex;
  justify-content: space-between; /* Adjusted to space out buttons */
  align-items: center;
  padding: 1rem 2rem; /* Adjusted padding */
  background-color: #333;
  color: white;
}

.left-buttons {
  display: flex;
  align-items: center;
}

.new-page-btn {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  padding: 0.8rem 1.5rem; /* Adjusted padding */
  border-radius: 50px; /* Make button oval-shaped */
  font-size: 1.1rem; /* Adjust font size */
  width: 150px;
  margin-right: 1rem; /* Add margin to the right */
}

.new-page-btn:hover {
  text-decoration: underline;
}

.logout-btn {
  background-color: #b23b3b;
  color: white;
  border: none;
  cursor: pointer;
  padding: 0.8rem 1.5rem; /* Adjusted padding */
  border-radius: 50px; /* Make button oval-shaped */
  font-size: 1.1rem; /* Adjust font size */
  width: 130px;
  margin-left: auto; /* Push the logout button to the right */
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
