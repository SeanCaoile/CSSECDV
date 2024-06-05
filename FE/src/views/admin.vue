<template>
  <div class="admin">
    <nav class="navbar">
      <button class="home-btn" @click="goHome">Home</button>
      <h1 class="navbar-title">Admin Page</h1>
      <button class="logout-btn red" @click="logout">Logout</button>
    </nav>
    <div class="centered">
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
    </div>
  </div>
</template>

<script>
import { resetAppStyles, setAppStylesForHome } from '../utils/stylesUtils';
import Cookies from 'js-cookie';

export default {
  data() {
    return {
      name: '',
      isAdmin: null,
      users: []
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

  async mounted() {
    this.validateSession();
  },

  methods: {
    async validateSession() {
      const sessionId = Cookies.get('sessionId');
      if (!sessionId) {
        this.$router.push('/');
        return;
      }

      // Validate session with backend
      try {
        const response = await fetch('http://localhost:3001/api/users/validate_session', {
          method: 'POST',
          body: JSON.stringify({ sessionId }),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json' 
          }
        });

        if (!response.ok) {
          throw new Error('Failed to validate session');
        }

        const data = await response.json();
        if (!data.authenticated || !data.isAdmin) {
          Cookies.remove('sessionId', { secure: true, sameSite: 'Strict' });
          this.$router.push('/');
          return;
        }

        // Fetch users if session is valid and user is an admin
        await this.fetchUsers();
      } catch (error) {
        console.error('Failed to validate session', error);
        Cookies.remove('sessionId', { secure: true, sameSite: 'Strict' });
        this.$router.push('/');
      }
    },

    async fetchUsers() {
      try {
        const response = await fetch('http://localhost:3001/api/users/showUsers');
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
        query: { name: this.name, isAdmin: this.isAdmin }
      });
    },

    logout() {
      Cookies.remove('sessionId', { secure: true, sameSite: 'Strict' });
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
    background-color: #b23b3b; /* Set background color to red */
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
    color: #555; /* Adjust the color brightness */
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    border-right: 1px solid #ddd; /* Add vertical line */
  }
  
  th {
    background-color: #f2f2f2;
    color: black; 
    font-weight: bold;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  </style>
  