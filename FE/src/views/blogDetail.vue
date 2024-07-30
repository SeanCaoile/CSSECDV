<template>
  <div class="blog-detail">
    <div class="blog-content">
      <div class="blog-text">
        <h1>{{ blog.title }}</h1>
        <p class="author">Author: {{ blog.authorEmail }}</p>
        <p class="date">Date Created: {{ formatDate(blog.dateCreated) }}</p>
        <p>{{ blog.content }}</p>
      </div>
      
      <!-- Buttons container -->
      <div class="buttons-container">
        <button class="back-button" @click="goBack">Back</button>
        <button v-if="isAuthor" class="edit-button" @click="editBlog">Edit</button>
        <!-- Delete Button for Admins -->
        <button v-if="isAdmin || isAuthor" class="delete-button" @click="confirmDelete">Delete</button>
      </div>
      
      <!-- Confirmation Dialog for Deletion -->
      <div v-if="confirmDeleteDialog" class="confirm-delete">
        <p>Are you sure you want to delete this blog post?</p>
        <button class="confirm-button" @click="deleteBlog">Yes</button>
        <button class="cancel-button" @click="confirmDeleteDialog = false">No</button>
      </div>
      
    </div>
  </div>
</template>

<script>
import { setAppStylesForBlogDetail } from '../utils/stylesUtils';

export default {
  props: {
    blogID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      blog: {},
      currentUser: null,
      isAuthor: false, // Flag to check if current user is the author
      isAdmin: false,  // Flag to check if current user is an admin
      confirmDeleteDialog: false // Flag to show confirmation dialog
    };
  },
  created() {
    this.fetchBlog(this.blogID);
    this.fetchCurrentUser();
    setAppStylesForBlogDetail(); // Apply styles for blog detail page
  },
  methods: {
    async fetchBlog(blogID) {
      try {
        const response = await fetch(`http://localhost:3001/api/blogs/${blogID}`);
        if (!response.ok) {
          throw new Error('Failed to fetch blog');
        }
        const data = await response.json();
        this.blog = data;
        this.checkAuthorization();
      } catch (error) {
        console.error('Failed to fetch blog', error);
      }
    },
    async fetchCurrentUser() {
      try {
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
        this.currentUser = data;
        this.isAdmin = data.isAdmin; // Update isAdmin flag
        this.checkAuthorization();
      } catch (error) {
        console.error('Failed to fetch current user', error);
      }
    },
    checkAuthorization() {
      if (this.currentUser && this.blog.authorID) {
        this.isAuthor = this.currentUser.id === this.blog.authorID;
      }
    },
    editBlog() {
      this.$router.push({ name: 'editBlog', params: { blogID: this.blogID } });
    },
    async deleteBlog() {
      try {
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
    confirmDelete() {
      this.confirmDeleteDialog = true; // Show confirmation dialog
    },
    goBack() {
      this.$router.push({ name: 'home' }); // Navigate to the home page
    },
    formatDate(dateString) {
      // Create a new Date object from the dateString
      const date = new Date(dateString);
      // Extract the date parts
      const day = date.getDate();
      const month = date.getMonth() + 1; // Months are zero-based
      const year = date.getFullYear();
      // Format the date as "YYYY-MM-DD"
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
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

.blog-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.blog-content {
  max-width: 800px;
  padding: 2rem;
  background-color: #fff; /* White background */
  color: #000; /* Black font color */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Optional: Adds a shadow for depth */
  box-sizing: border-box; /* Ensures padding is included in the element's total width and height */
  position: relative; /* Enable absolute positioning for child elements */
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.blog-text {
  flex: 1; /* Take up available space */
}

h1 {
  font-size: 3rem; /* Larger font size for title */
  font-weight: bold; /* Bold font for title */
  margin-bottom: 0.5rem; /* Add some space below the title */
}

.author, .date {
  font-size: 1rem; /* Smaller font size for author and date */
  margin: 0.25rem 0; /* Add some space above and below */
}

.buttons-container {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.back-button {
  background-color: #007bff; /* Blue color for the back button */
}

.back-button:hover {
  background-color: #0056b3; /* Darker blue on hover */
}

.edit-button {
  background-color: #6c757d; /* Gray color for the edit button */
}

.edit-button:hover {
  background-color: #5a6268; /* Darker gray on hover */
}

.delete-button {
  background-color: #dc3545; /* Red color for delete button */
}

.delete-button:hover {
  background-color: #c82333; /* Darker red on hover */
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
