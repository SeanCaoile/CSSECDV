<template>
  <div class="create-blog">
    <h2>Create a New Blog</h2>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="title">Title:</label>
        <input type="text" id="title" v-model="blog.title" required />
      </div>
      <div class="form-group">
        <label for="content">Content:</label>
        <textarea id="content" v-model="blog.content" required></textarea>
      </div>
      
      <button type="submit">Create Blog</button>
    </form>
  </div>
</template>

<script>
import { resetAppStyles, setAppStylesForHome } from '../utils/stylesUtils';

export default {
  data() {
    return {
      blog: {
        title: '',
        content: '',
        authorID: '', // This will be set after fetching user data
        authorEmail: '', // This will be set after fetching user data
        dateCreated: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
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
  created() {
    this.fetchCurrentUser();
  },
  methods: {
    async fetchCurrentUser() {
      try {
        const response = await fetch('http://localhost:3001/api/users/validate_session', {
          method: 'POST',
          credentials: 'include', // Send cookies with the request
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Error fetching current user:', text);
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.authenticated) {
          this.blog.authorID = data.id;
          this.blog.authorEmail = data.email;
        } else {
          // Handle unauthenticated state
          console.error('User is not authenticated');
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    },
    async submitForm() {
      try {
        const response = await fetch('http://localhost:3001/api/createBlog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.blog)
        });
        const data = await response.json();
        console.log('Blog created successfully:', data);
        // Redirect to another page or give feedback to the user
        this.$router.push('/home');
      } catch (error) {
        console.error('There was an error creating the blog:', error);
      }
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
          return response.text().then(text => {
            console.error('Failed to validate session:', text);

            
            fetch('http://localhost:3001/api/users/removeCookie', {
              method: 'POST',
              credentials: 'include',
            });
            this.unauthenticate();
            this.$router.push('/');

            throw new Error('Failed to validate session');
          });
        }
        return response.json();
      })
      .then(data => {
        if (data.authenticated) {
          this.name = data.name;
          this.isAdmin = data.isAdmin;
        } else {
          fetch('http://localhost:3001/api/users/removeCookie', {
            method: 'POST',
            credentials: 'include',
          });
          this.unauthenticate();
          this.$router.push('/');
        }
      })
      .catch(error => {
        console.error('Failed to validate session', error);
        fetch('http://localhost:3001/api/users/removeCookie', {
          method: 'POST',
          credentials: 'include',
        });
        this.unauthenticate();
        this.$router.push('/');
      });
    }
  }
};
</script>

<style scoped>
.create-blog {
  width: 600px;
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: black;
}

h2 {
  text-align: center;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input[type='text'],
textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1.1rem; /* Increased font size */
}

input[type='text'] {
  height: 2.5rem; /* Increased height for input box */
}

textarea {
  height: 250px; /* Increased height for textarea */
}

button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
