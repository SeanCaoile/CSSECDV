<template>
  <div class="blog-detail">
    <h2>{{ blog.title }}</h2>
    <p>{{ blog.content }}</p>
    <p>Author: {{ blog.authorEmail }}</p>
    <p>Date Created: {{ blog.dateCreated }}</p>

    <!-- Edit button, shown if the current user matches the blog author -->
    <button v-if="isAuthor" @click="editBlog">Edit Blog</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      blog: {},
      isAuthor: false  // Flag to determine if current user is the author of the blog
    };
  },
  created() {
    // Fetch blog details based on route parameter (blog ID)
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

        // Check if the current user matches the author of the blog
        const currentUserEmail = ''; // Set this to the current user's email (from session or state)
        this.isAuthor = this.blog.authorEmail === currentUserEmail;
      } catch (error) {
        console.error('Error fetching blog:', error);
      }
    },
    editBlog() {
      // Redirect or navigate to the edit page for this blog
      this.$router.push(`/blogs/${this.blog.id}/edit`);
    }
  }
};
</script>

<style scoped>
.blog-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}
h2 {
  margin-bottom: 0.5rem;
}
button {
  padding: 0.5rem;
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
