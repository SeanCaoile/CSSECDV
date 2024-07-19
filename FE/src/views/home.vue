<template>
  <div>
    <nav class="navbar">
      <div class="left-buttons">
        <button v-if="isAdmin" class="new-page-btn" @click="adminView">Admin Page</button>
      </div>
      <button class="logout-btn" @click="logout">Logout</button>
    </nav>
    <div class="centered">
      <h1>Welcome: {{ name }}</h1>
      <br />
      <div v-if="blogs.length === 0">
        <p>No blogs found.</p>
      </div>
      <div v-else>
        <div v-for="blog in blogs" :key="blog.blogID" class="blog-item">
          <h2>{{ blog.title }}</h2>
          <p>{{ blog.content }}</p>
          <p>Author: {{ blog.authorEmail }}</p>
          <p>Date Created: {{ blog.dateCreated }}</p>
          <!-- Button to view blog details -->
          <button @click="viewBlogDetail(blog.blogID)">View Details</button>
          <hr>
        </div>
        <div>
          <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
        </div>
      </div>
      <button class="create-blog-btn" @click="goCreateBlog">Create Blog</button>
    </div>
  </div>
</template>


<script>
import { resetAppStyles, setAppStylesForHome } from '../utils/stylesUtils';
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      name: '',
      isAdmin: null,
      blogs: [], // Array to store fetched blogs
      currentPage: 1,
      limit: 10,
      totalPages: 1
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
    this.fetchBlogs(); // Fetch blogs when component mounts
  },

  methods: {
    ...mapActions(['unauthenticate']),

    adminView() {
      this.$router.push('/admin');
    },

    goCreateBlog() {
      this.$router.push({ 
        path: '/createBlog',
      });
    },

    viewBlogDetail(blogId) {
      this.$router.push({ path: `/blogs/${blogId}` });
    },

    editBlog(blogId) {
      this.$router.push({ path: `/blogs/${blogId}/edit` });
    },

    async logout() {
      const response = await fetch('http://localhost:3001/api/users/removeCookie', {
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
          throw new Error('Failed to validate session');
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
    },

    fetchBlogs() {
      fetch('http://localhost:3001/api/blogs?page=${this.currentPage}&limit=${this.limit}')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch blogs');
          }
          return response.json();
        })
        .then(data => {
          // Assuming 'data' is an array of blogs
          this.blogs = data.data;
          this.currentPage = data.currentPage;
          this.totalPages = data.totalPages;
        })
        .catch(error => {
          console.error('Failed to fetch blogs', error);
        });
    },

    nextPage(){
      this.currentPage += 1;
      this.fetchBlogs();
    },

    prevPage(){
      this.currentPage -= 1;
      this.fetchBlogs();
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

.left-buttons {
  display: flex;
  align-items: center;
}

.new-page-btn {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  font-size: 1.1rem;
  width: 150px;
  margin-right: 1rem;
}

.new-page-btn:hover {
  text-decoration: underline;
}

.logout-btn {
  background-color: #b23b3b;
  color: white;
  border: none;
  cursor: pointer;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  font-size: 1.1rem;
  width: 130px;
  margin-left: auto;
}

.logout-btn:hover {
  text-decoration: underline;
}

.centered {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: calc(100vh - 6rem); /* Full height minus navbar */
  text-align: center;
}

h1 {
  font-size: 2rem;
  color: #333;
}

.blog-item {
  max-width: 600px;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f9f9f9;
  color:black;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  margin-right: 1rem;
}

button:hover {
  background-color: #0056b3;
}

.create-blog-btn {
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.create-blog-btn:hover {
  background-color: #0056b3;
}
</style>
