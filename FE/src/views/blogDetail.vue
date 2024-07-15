<template>
  <div class="blog-detail">
    <div class="blog-content">
      <h1>{{ blog.title }}</h1>
      <p>{{ blog.content }}</p>
      <p>Author: {{ blog.authorEmail }}</p>
      <p>Date Created: {{ blog.dateCreated }}</p>
      
      <!-- Edit button, visible only to the author -->
      <button v-if="isAuthor" @click="editBlog">Edit Blog</button>
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
      blog: {},
      currentUser: null,
      isAuthor: false // Flag to check if current user is the author
    };
  },
  created() {
    this.fetchBlog(this.blogID);
    this.fetchCurrentUser();
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
    }
  }
};
</script>

<style scoped>
.blog-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; /* Ensures the component takes full height */
}

.blog-content {
  max-width: 800px;
  padding: 1rem;
  background-color: #fff; /* White background */
  color: #000; /* Black font color */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Optional: Adds a shadow for depth */
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 0.5rem;
}

button {
  padding: 0.75rem 1.5rem;
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
