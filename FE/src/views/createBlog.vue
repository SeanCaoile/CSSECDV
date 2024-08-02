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
    created() {
      this.fetchCurrentUser();
    },
    methods: {
      async fetchCurrentUser() {
        /*try {
          const response = await fetch('http://localhost:3001/api/users/validate_session', {
            credentials: 'include' // Send cookies with the request
          });
          console.log("printing response");
          console.log(response);
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
      },*/
      fetch('https://localhost:3001/api/users/validate_session', {
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
            console.log("printing data for " + data.email);
        
            this.blog.authorID = data.id;
            this.blog.authorEmail = data.email;
        } else {
          fetch('https://localhost:3001/api/users/removeCookie', {
            method: 'POST',
            credentials: 'include',
          });
          this.unauthenticate();
          this.$router.push('/');
        }
      })
      .catch(error => {
        console.error('Failed to validate session', error);
        fetch('https://localhost:3001/api/users/removeCookie', {
          method: 'POST',
          credentials: 'include',
        });
        this.unauthenticate();
        this.$router.push('/');
      });
    },
      async submitForm() {
        try {
          const response = await fetch('https://localhost:3001/api/blogs', {
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
          console.error('There was an error creating the blog');
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .create-blog {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    text-align: center;
    margin-bottom: 1rem;
    color: black;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: black;
  }
  
  input[type='text'],
  textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
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
  