<template>
    <div class="edit-blog">
      <h2>Edit Blog</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="title">Title:</label>
          <input type="text" id="title" v-model="blog.title" required />
        </div>
        <div class="form-group">
          <label for="content">Content:</label>
          <textarea id="content" v-model="blog.content" required></textarea>
        </div>
        <button type="submit">Save Changes</button>
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
          content: ''
        }
      };
    },
    created() {
      const blogId = this.$route.params.id;
      this.fetchBlog(blogId);
    },
    methods: {
      async fetchBlog(blogId) {
        try {
          const response = await fetch(`http://localhost:3001/api/blogs/${blogId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch blog');
          }
          const data = await response.json();
          this.blog = data;
        } catch (error) {
          console.error('Error fetching blog:', error);
        }
      },
      async submitForm() {
        try {
          const response = await fetch(`http://localhost:3001/api/blogs/${this.blog.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.blog)
          });
          if (!response.ok) {
            throw new Error('Failed to update blog');
          }
          // Redirect to the blog detail page after successful update
          this.$router.push(`/blogs/${this.blog.id}`);
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
  