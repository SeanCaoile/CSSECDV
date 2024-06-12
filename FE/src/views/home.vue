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
      <br />
      <div class="user-photo-container">
        <img v-if="photo" :src="photo" alt="User Photo" class="user-photo"/>
      </div>
    </div>
  </div>
</template>

<script>
import { resetAppStyles, setAppStylesForHome } from '../utils/stylesUtils';
// import Cookies from 'js-cookie';
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      name: '',
      photo: '',
      isAdmin: null
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
    this.validateSession();
  },

  methods: {
    ...mapActions(['unauthenticate']),

    adminView() {
      this.$router.push('/admin');
    },

    async logout() {
      const response = await fetch('http://localhost:3001/api/users/removeCookie', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
          console.log('Logged out successfully');
      } else {
          console.error('Logout failed');
      }
      
      this.unauthenticate();
      this.$router.push('/');
    },

    validateSession() {
      fetch('http://localhost:3001/api/users/validate_session', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json' 
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to validate session');
        }
        return response.json();
      })
      .then(data => {
        if (data.authenticated) {
          this.name = data.name;
          this.isAdmin = data.isAdmin;
          this.photo = data.photo;
        } else {
          this.unauthenticate();
          this.$router.push('/');
        }
      })
      .catch(error => {
        console.error('Failed to validate session', error);
        this.unauthenticate();
        this.$router.push('/');
      });
    },
    // fetchUserPhoto() {
    //   console.log('fetching user photo') //delete this later
    //   fetch('http://localhost:3001/api/users/photo', {
    //     method: 'GET',
    //     credentials: 'include',
    //   })
    //   .then(response => {
    //     if (!response.ok) {
    //       throw new Error('Failed to fetch user photo');
    //     }
    //     return response.blob();
    //   })
    //   .then(blob => {
    //     this.imageSrc = URL.createObjectURL(blob);
    //     console.log('got photo') //delete this later
    //     console.log(this.imageSrc) //delete this later
    //   })
    //   .catch(error => {
    //     console.error('Failed to fetch user photo', error);
    //   });
    // },
    fetchUserData() {
      fetch('http://localhost:3001/api/get-user-data', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then(data => {
        this.name = data.name;
        this.isAdmin = data.isAdmin;
      })
      .catch(error => {
        console.error('Failed to fetch user data', error);
        this.unauthenticate();
        this.$router.push('/');
      });
    },
    
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
  flex-direction: column;
  height: calc(100vh - 6rem); /* Full height minus navbar */
  text-align: center;
}

h1 {
  font-size: 2rem; /* Adjusted font size */
  color: #333;
}

.user-photo-container {
  display: block; /* Ensures the container takes up the full width and starts on a new line */
}
</style>
