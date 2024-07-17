<template>
  <div class="admin">
    <nav class="navbar">
      <button class="home-btn" @click="goHome">Home</button>
      <h1 class="navbar-title">Admin Page</h1>
      <button class="logout-btn red" @click="logout">Logout</button>
    </nav>
    <div class="centered">
      <div v-if="loading">
        <!-- Loading indicator -->
        <p>Loading...</p>
      </div>
      <div v-else>
        <div v-if="users.length > 0">
          <h2 class="users-header">Users:</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Numbers</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.phoneNumber }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <p>No users found.</p>
        </div>
        <div class="announcement-form">
          <h2>Create Announcement</h2>
          <form @submit.prevent="createAnnouncement">
            <div>
              <label for="announcementContent">Content:</label>
              <textarea v-model="announcementContent" id="announcementContent" required></textarea>
              <p v-if="contentError" class="error">{{ contentError }}</p>
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { resetAppStyles, setAppStylesForHome } from '../utils/stylesUtils';
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      users: [],
      loading: true,
      authorEmail: '', // This will be set after fetching user data
      announcementContent: '',
      contentError: '' // Error message for announcement content
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

    async validateSession() {
      try {
        const response = await fetch('https://localhost:3001/api/users/validate_session', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to validate session');
        }
        const data = await response.json();
        if (data.authenticated) {
          await this.fetchUsers(); // Wait for fetchUsers to complete
          this.authorEmail = data.email;
        } else {
          fetch('https://localhost:3001/api/users/removeCookie', {
            method: 'POST',
            credentials: 'include',
          });
          this.unauthenticate();
          this.$router.push('/');
        }
      } catch (error) {
        console.error('Failed to validate session', error);
        fetch('https://localhost:3001/api/users/removeCookie', {
          method: 'POST',
          credentials: 'include',
        });
        this.unauthenticate();
        this.$router.push('/');
      } finally {
        this.loading = false; // Set loading to false regardless of success or failure
      }
    },

    async fetchUsers() {
      try {
        const response = await fetch('https://localhost:3001/api/users/showUsers', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const allUsers = await response.json();
        // Filter out users with isAdmin set to 1
        this.users = allUsers.filter(user => user.isAdmin !== 1)
                              .map(({ name, email, phoneNumber }) => ({ name, email, phoneNumber }));
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    },

    goHome() {
      this.$router.push({ 
        path: '/home',
      });
    },

    async logout() {
      const response = await fetch('https://localhost:3001/api/users/removeCookie', {
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

    async createAnnouncement() {
      if (!this.validateAnnouncement()) {
        return;
      }

      try {
        const response = await fetch('https://localhost:3001/api/announcements/create', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: this.announcementContent,
            email: this.authorEmail
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create announcement');
        }

        this.announcementContent = '';
        this.contentError = '';
        alert('Announcement created successfully');
      } catch (error) {
        console.error('Error creating announcement');
        alert('Failed to create announcement');
      }
    },

    validateAnnouncement() {
      const contentPattern = /^.{0,500}$/;
      if (!contentPattern.test(this.announcementContent)) {
        this.contentError = 'Announcement must be under 500 characters';
        return false;
      }
      this.contentError = '';
      return true;
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
  height: 6rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #333;
  color: white;
}

.home-btn,
.logout-btn {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  font-size: 1.1rem;
  width: 130px;
}

.logout-btn.red {
  background-color: #b23b3b;
}

.home-btn:hover,
.logout-btn:hover {
  text-decoration: underline;
}

.navbar-title {
  font-size: 2rem;
  color: #fff;
  margin: 0;
}

.centered {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 6rem);
  text-align: center;
}

h2 {
  font-size: 1.5rem;
  color: #333;
}

.users-header {
  font-weight: bold;
  color: #555;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}

th, td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
  color: black; 
  font-weight: bold;
}

.announcement-form {
  width: 100%;
  max-width: 600px;
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #1d1d1d;
}

.announcement-form h2 {
  color: white;
  margin-bottom: 1rem;
}

.announcement-form form {
  display: flex;
  flex-direction: column;
}

.announcement-form label {
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.announcement-form input,
.announcement-form textarea {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.announcement-form button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 50px;
  background-color: #007bff;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
}

.announcement-form button:hover {
  background-color: #0056b3;
}

.error {
  color: red;
  font-size: 0.9rem;
}
</style>
