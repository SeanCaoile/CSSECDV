<template>
  <div class="blog-detail">
    <div class="blog-content">
      <div class="blog-text">
        <h1>{{ blog.title }}</h1>
        <div class="author-info">
          <img v-if="blog.authorPhoto" :src="blog.authorPhoto" alt="Author Photo" class="author-photo">
          <div class="author-details">
            <p class="author">Author: {{ blog.authorEmail }}</p>
            <p class="date">Date Created: {{ formatDate(blog.dateCreated) }}</p>
          </div>
        </div>
        <p>{{ blog.content }}</p>
      </div>
      
      <!-- Buttons container -->
      <div class="buttons-container">
        <button class="back-button" @click="goBack">Back</button>
        <button v-if="isAuthor" class="edit-button" @click="editBlog">Edit</button>
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
import { mapActions, mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters(['blogId']),
  },

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
      isAuthor: false,
      isAdmin: false,
      confirmDeleteDialog: false
    };
  },
  created() {
    console.log("BLOGID", this.blogId);
    if (!this.blogId) {
      this.$router.push('/');
    }

    this.fetchBlog();
    this.fetchCurrentUser();
    setAppStylesForBlogDetail();
  },
  methods: {
    ...mapActions(['clearBlogId']),
    beforeRouteLeave(to, from, next) {
      this.clearBlogId();
      next();
    }, 

    async fetchBlog() {
      try {
        const response = await fetch('https://localhost:3001/api/blogs/getBlogById', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ blogID: this.blogID })
        });
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
        const response = await fetch('https://localhost:3001/api/users/validate_session', {
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
    async checkAuthorization() {
      if (this.currentUser && this.blogID) {
        try {
          const response = await fetch('https://localhost:3001/api/blogs/checkAuthorization', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              blogID: this.blogID,
              userID: this.currentUser.id
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const { canEdit, canDelete } = await response.json();
          this.isAuthor = canEdit;
          this.isAdmin = canDelete;
        } catch (error) {
          console.error('Failed to check authorization:', error);
        }
      }
    },
    editBlog() {
      this.$router.push({ name: 'editBlog', params: { blogID: this.blogID } });
    },
    async deleteBlog() {
      try {
        const response = await fetch('https://localhost:3001/api/blogs/deleteBlog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ blogID: this.blogID })
        });
        if (response.ok) {
          console.log('Blog deleted successfully');
          this.$router.push('/home');
        } else {
          const errorText = await response.text();
          console.error('Failed to delete blog', errorText);
        }
      } catch (error) {
        console.error('Error deleting blog', error);
      }
    },
    confirmDelete() {
      this.confirmDeleteDialog = true;
    },
    goBack() {
      this.$router.push({ name: 'home' });
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
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
  background-color: #f5f5f5;
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
  background-color: #fff;
  color: #000;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.blog-text {
  flex: 1;
  word-break: break-word;
}

h1 {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.author-photo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.author, .date {
  font-size: 1rem;
  margin: 0.25rem 0;
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
  background-color: #007bff;
}

.back-button:hover {
  background-color: #0056b3;
}

.edit-button {
  background-color: #6c757d;
}

.edit-button:hover {
  background-color: #5a6268;
}

.delete-button {
  background-color: #dc3545;
}

.delete-button:hover {
  background-color: #c82333;
}

.confirm-delete {
  margin-top: 20px;
  background-color: #f8d7da;
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
  background-color: #dc3545;
}

.confirm-button:hover {
  background-color: #c82333;
}

.cancel-button {
  background-color: #6c757d;
}

.cancel-button:hover {
  background-color: #5a6268;
}
</style>
