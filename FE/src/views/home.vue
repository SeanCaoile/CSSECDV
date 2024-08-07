<template>
  <div>
    <nav class="navbar">
      <div class="left-buttons">
        <button v-if="isAdmin" class="new-page-btn" @click="adminView">Admin Page</button>
        <!-- <button class="new-page-btn" @click="adminView">Admin Page</button> -->
      </div>
      <button class="logout-btn" @click="logout">Logout</button>
    </nav>
    <div class="announcement-bar" v-if="announcement">
      <p>Latest Announcement: {{ announcement.content }}</p>
    </div>
    <div class="centered">
      <h1>Welcome: {{ name }}</h1>
      <br />
      <div v-if="blogs.length === 0">
        <p>No blogs found.</p>
      </div>
      <div v-else>
        <div v-for="blog in blogs" :key="blog.blogID" class="blog-item">
          <h2>{{ truncate(blog.title, 20) }}</h2>
          <p class="author">Author: {{ blog.authorEmail }}</p>
          <p class="date">Date Created: {{ formatDate(blog.dateCreated) }}</p>
          <p>{{ truncate(blog.content, 10 )}}</p>
          <button @click="viewBlogDetail(blog.blogID)">View Details</button>
          <hr>
        </div>
        <div class="pagination-controls">
          <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
          <label for="page" style="margin-right: 1mm;">Page: </label>
          <input type="number" id="customPage" v-model="customPage" autocomplete="off"/>
          <button @click="inputPage()">Go to Page</button>
          
        </div>
        <span v-if="nameError" class="error-message">{{ nameError }}</span>
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
      photo: '',
      announcement: null,
      isAdmin: null,
      blogs: [],
      currentPage: 1,
      limit: 10,
      totalPages: 1,
      nameError: '',
      customPage: ''
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
    this.fetchLastAnnouncement();
    this.fetchBlogs();
  },

  methods: {
    ...mapActions(['unauthenticate', 'setBlogId']),

    viewBlogDetail(blogId) {
      this.setBlogId(blogId);
      this.$router.push('/blogs/blogDetail');
    },

    adminView() {
      this.validateSession();
      this.adminCheck();
      this.$router.push('/admin');
    },

    goCreateBlog() {
      this.$router.push({ 
        path: '/createBlog',
      });
    },

  

    async adminCheck(){
      try{
        const response = await fetch('https://localhost:3001/api/users/validate_admin', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.ok == false) {
          throw new Error('Failed to validate user');
        } 
        const data = await response.json();
        if (!(data.authenticated)) {
          fetch('https://localhost:3001/api/users/removeCookie', {
            method: 'POST',
            credentials: 'include',
          });
          this.unauthenticate();
          this.$router.push('/');
        }
      } catch (error) {
        console.error('Failed to validate session', error);
        fetch('https://localhost:3001/api/users/removeCookie', {
          method: 'POST',
          credentials: 'include',
        });
        this.unauthenticate();
        this.$router.push('/');
      } finally {
        this.loading = false; // Set loading to false regardless of success or failure
      }
    },

    async logout() {
      const response = await fetch('https://localhost:3001/api/users/removeCookie', {
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
      fetch('https://localhost:3001/api/users/validate_session', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json' 
        }
      })
      .then(response => {
        if (!response.ok) {
          console.error('Failed to validate session');
          fetch('https://localhost:3001/api/users/removeCookie', {
            method: 'POST',
            credentials: 'include',
          });
          this.unauthenticate();
          this.$router.push('/');
        }
        return response.json();
      })
      .then(data => {
        if (data.authenticated) {
          this.name = data.name;
          this.isAdmin = data.isAdmin;
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

    fetchBlogs(newPage) {
      this.validateSession();

      fetch('https://localhost:3001/api/showBlogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          page: newPage,
          limit: this.limit,
          totalPages: this.totalPages
        })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch blogs');

          }
          return response.json();
        })
        .then(data => {
          this.blogs = data.data;
          this.currentPage = data.currentPage;
          this.totalPages = data.totalPages;
        })
        .catch(error => {
        console.error('Failed to fetch data', error);
        
      }); 
    },
    
    fetchLastAnnouncement() {
      fetch('https://localhost:3001/api/announcements/last', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch the last announcement');
          }
          return response.json();
        })
        .then(data => {
          if (data && data.isExpired === 0) {
            this.announcement = data;
          } else {
            this.announcement = null; // Hide announcement if it's expired
          }
        })
        .catch(error => {
          console.error('Failed to fetch the last announcement', error);
        });
    },

    nextPage(){
      this.fetchBlogs(this.currentPage+1);
    },

    prevPage(){
      this.fetchBlogs(this.currentPage-1);
    },

    inputPage(){
        const isPageValid = this.validatePage()
        
        if(!isPageValid){
          return;
        }
        this.fetchBlogs(this.customPage);
    },

    validatePage(){
        const pagePattern = /^[1-9][0-9]{0,2}$/; // pages 1-999
        if(!pagePattern.test(this.customPage) || this.customPage > this.totalPages){
          this.nameError = 'Invalid page number';
          return false;
        }
        this.nameError = '';
        return true;
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    },

    truncate(text, length){
        if(text.length > length){
          return text.substring(0, length) + '...';
        }
        else{
          return text;
        }
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

.announcement-bar {
  position: fixed;
  top: 6rem;
  left: 0;
  width: 100%;
  background-color: #ff9800;
  color: black;
  text-align: center;
  padding: 1rem 0;
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
  text-align: center;
  margin-top: 200px; /* Adjust this value as needed */
  margin-bottom: 50px;
  margin-left: 25px;
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
  color: black;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.blog-item h2 {
  font-size: 1.5rem; /* Larger font size for title */
  font-weight: bold; /* Bold font for title */
  margin-bottom: 0.5rem; /* Add some space below the title */
}

.blog-item .author, 
.blog-item .date {
  font-size: 1rem; /* Smaller font size for author and date */
  margin: 0.25rem 0; /* Add some space above and below */
}

.blog-item p {
  text-align: justify; /* Justify the text within blog content */
}

button {
  padding: 0.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 1rem;
  align-items: center;
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

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-controls button {
  margin: 0 10px;
}

input[type="number"] {
  width: 60px;
}

.error-message {
  color: red;
}
</style>
