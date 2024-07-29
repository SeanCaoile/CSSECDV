<template>
    <div class="delete-blog">
      <div class="blog-content">
        <h1>Delete Blog Post</h1>
        <div v-if="blog">
          <div class="blog-text">
            <h2>{{ blog.title }}</h2>
            <p class="author">Author: {{ blog.authorEmail }}</p>
            <p class="date">Date Created: {{ formatDate(blog.dateCreated) }}</p>
            <p>{{ blog.content }}</p>
          </div>
          <div class="buttons-container">
            <button class="back-button" @click="goBack">Back</button>
            <button class="delete-button" @click="confirmDelete = true">Delete</button>
          </div>
          <div v-if="confirmDelete" class="confirm-delete">
            <p>Are you sure you want to delete this blog post?</p>
            <button class="confirm-button" @click="deleteBlog">Yes</button>
            <button class="cancel-button" @click="confirmDelete = false">No</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      blogID: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        blog: null,
        confirmDelete: false
      };
    },
    created() {
      this.fetchBlog();
    },
    methods: {
      async fetchBlog() {
        try {
          const response = await fetch(`http://localhost:3001/api/blogs/${this.blogID}`);
          if (response.ok) {
            this.blog = await response.json();
          } else {
            console.error('Failed to fetch blog');
          }
        } catch (error) {
          console.error('Error fetching blog', error);
        }
      },
      async deleteBlog() {
        try {
          console.log('Sending delete request for blogID:', this.blogID);
          const response = await fetch('http://localhost:3001/api/blogs/deleteBlog', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ blogID: this.blogID })
          });
          if (response.ok) {
            console.log('Blog deleted successfully');
            this.$router.push('/home'); // Redirect to home page
          } else {
            const errorText = await response.text();
            console.error('Failed to delete blog', errorText);
          }
        } catch (error) {
          console.error('Error deleting blog', error);
        }
      },
      goBack() {
        this.$router.push('/home'); // Navigate to home page
      },
      formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      }
    }
  };
  </script>
  
  <style scoped>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }
  
  #app {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5; /* Light background color for contrast */
  }
  
  .delete-blog {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh; /* Full viewport height */
  }
  
  .blog-content {
    max-width: 800px;
    padding: 2rem;
    background-color: #fff; /* White background */
    color: #000; /* Black font color */
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Optional: Adds a shadow for depth */
    box-sizing: border-box; /* Ensures padding is included in the element's total width and height */
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .buttons-container {
    display: flex;
    justify-content: space-between; /* Space between buttons */
    margin-bottom: 1rem; /* Space below buttons */
  }
  
  .back-button {
    padding: 0.75rem 1.5rem;
    background-color: #007bff; /* Blue color for back button */
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .back-button:hover {
    background-color: #0056b3; /* Darker blue on hover */
  }
  
  .delete-button {
    padding: 0.75rem 1.5rem;
    background-color: #dc3545; /* Red color for delete button */
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .delete-button:hover {
    background-color: #c82333; /* Darker red on hover */
  }
  
  .blog-text {
    flex: 1; /* Take up available space */
  }
  
  h1 {
    font-size: 2rem; /* Adjusted size for header */
    font-weight: bold;
    margin-bottom: 1rem;
  }
  
  h2 {
    font-size: 1.5rem; /* Title size */
    margin-bottom: 0.5rem;
  }
  
  .author, .date {
    font-size: 1rem;
    margin: 0.25rem 0;
  }
  
  .confirm-delete {
    margin-top: 20px;
    background-color: #f8d7da; /* Light red background for confirmation area */
    padding: 1rem;
    border-radius: 5px;
  }
  
  .confirm-button, .cancel-button {
    padding: 0.75rem 1.5rem;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 0.5rem;
  }
  
  .confirm-button {
    background-color: #dc3545; /* Red color for confirm button */
  }
  
  .confirm-button:hover {
    background-color: #c82333; /* Darker red on hover */
  }
  
  .cancel-button {
    background-color: #6c757d; /* Gray color for cancel button */
  }
  
  .cancel-button:hover {
    background-color: #5a6268; /* Darker gray on hover */
  }
  </style>
  