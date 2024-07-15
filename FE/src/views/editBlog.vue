<template>
    <div class="edit-blog">
      <h2>Edit Blog Post</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="title">Title:</label>
          <input type="text" id="title" v-model="blog.title" required />
        </div>
        <div class="form-group">
          <label for="content">Content:</label>
          <textarea id="content" v-model="blog.content" required></textarea>
        </div>
        
        <!-- Only show edit button if current user is the author -->
        <button v-if="isAuthor" type="submit">Update Blog</button>
        <span v-else>You are not authorized to edit this blog.</span>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        blog: {
          id: '',
          title: '',
          content: '',
          authorID: '', // This will be set after fetching blog data
          // Other properties as needed
        },
        isAuthor: false // Flag to check if current user is the author
      };
    },
    created() {
      this.fetchBlog();
      this.fetchCurrentUser();
    },
    methods: {
      async fetchBlog() {
        try {
          const blogID = this.$route.params.blogID;
          const response = await fetch(`http://localhost:3001/api/blogs/${blogID}`);
          if (!response.ok) {
            throw new Error('Failed to fetch blog');
          }
          const data = await response.json();
          this.blog.id = data.blogID; // Adjust based on your API response
          this.blog.title = data.title;
          this.blog.content = data.content;
          this.blog.authorID = data.authorID; // Assuming you fetch authorID
          // Optionally update other blog properties
          this.checkAuthorization();
        } catch (error) {
          console.error('Error fetching blog:', error);
        }
      },
      async fetchCurrentUser() {
        try {
          // Fetch current user details or check session/token
          // Example: Use fetch or Axios to validate session
          const response = await fetch('http://localhost:3001/api/users/validate_session', {
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
          // Example assuming data contains current user details
          this.currentUser = data;
          this.checkAuthorization();
        } catch (error) {
          console.error('Error fetching current user:', error);
          // Handle unauthenticated state as needed
        }
      },
      checkAuthorization() {
        // Check if the current user is the author of the blog
        this.isAuthor = this.currentUser && this.blog.authorID === this.currentUser.id;
      },
      async submitForm() {
        try {
          const blogID = this.blog.id;
          const response = await fetch(`http://localhost:3001/api/blogs/${blogID}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.blog)
          });
          if (!response.ok) {
            throw new Error('Failed to update blog');
          }
          console.log('Blog updated successfully');
          this.$router.push(`/blogs/${blogID}`); // Redirect to blog detail page after successful update
        } catch (error) {
          console.error('Error updating blog:', error);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .edit-blog {
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
  