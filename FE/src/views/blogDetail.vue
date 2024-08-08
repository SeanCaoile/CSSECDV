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
  data() {
    return {
      blog: {},
      currentUser: null,
      isAuthor: false,
      isAdmin: false,
      confirmDeleteDialog: false
    };
  },
  async mounted() {
    if (!this.blogId) {
      this.$router.push('/');
    }

    await this.fetchBlog();
    await this.fetchCurrentUser();
    setAppStylesForBlogDetail();
  },
  methods: {
    ...mapActions(['unauthenticate', 'setBlogId']),

    async fetchBlog() {
      try {
        const response = await fetch('https://localhost:3001/api/blogs/getBlogById', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ blogID: this.blogId })
        });
        if (!response.ok) {
          this.$router.push('/');
          throw new Error('Failed to fetch blog');
        }
        const data = await response.json();
        this.blog = data;
        console.log('Blog:', this.blog);
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
          console.error('Failed to validate session');
          fetch('https://localhost:3001/api/users/removeCookie', {
            method: 'POST',
            credentials: 'include',
          });
          this.unauthenticate();
          this.$router.push('/');
        }
        const data = await response.json();
        if(data.authenticated){
          console.log('Current User:', data);
          this.checkAuthorization(data.id);
          this.isAdmin = data.isAdmin;
          return true;
        }
        else{
          console.error("Unauthenticated User");
          fetch('https://localhost:3001/api/users/removeCookie', {
            method: 'POST',
            credentials: 'include',
          });
          this.unauthenticate();
          this.$router.push('/');
        }
        return false;
      } catch (error) {
        console.error('Failed to fetch current user', error);
        fetch('https://localhost:3001/api/users/removeCookie', {
            method: 'POST',
            credentials: 'include',
          });
          this.unauthenticate();
          this.$router.push('/');
      }
    },
    async checkAuthorization(id) {
      try {
        const response = await fetch('https://localhost:3001/api/blogs/checkAuthorization', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            blogID: this.blog.blogID,
            userID: id
          })
        });

        if (!response.ok) {
          console.error(`Failed to perform server function`);
          fetch('https://localhost:3001/api/users/removeCookie', {
            method: 'POST',
            credentials: 'include',
          });
          this.unauthenticate();
          this.$router.push('/');
        }

        const { canEdit } = await response.json();
        this.isAuthor = canEdit;
      } catch (error) {
        console.error('Failed to check authorization:', error);
      }
    },
    editBlog() {
      if(this.fetchCurrentUser()){
        this.setBlogId(this.blog.blogID);
        this.$router.push('/blogs/editBlog');
      }
    },
    async deleteBlog() {
      try {
        const response = await fetch('https://localhost:3001/api/users/validate_session', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          if (!response.ok) {
            console.error('Failed to validate session');
            fetch('https://localhost:3001/api/users/removeCookie', {
              method: 'POST',
              credentials: 'include',
            });
            this.unauthenticate();
            this.$router.push('/');
          }
          const data = await response.json();
          
          if(data.authenticated){
            if(await this.fetchCurrentUser() && (this.isAdmin||this.isAuthor)){
              try {
                const response = await fetch('https://localhost:3001/api/blogs/deleteBlog', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ blogID: this.blogId, id: data.id, email: data.email })
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
            }
            else{
              console.error("Unauthorized User");
                fetch('https://localhost:3001/api/users/removeCookie', {
                  method: 'POST',
                  credentials: 'include',
                });
                this.unauthenticate();
                this.$router.push('/');
            }
          } else {
              console.error("Unauthenticated User");
              fetch('https://localhost:3001/api/users/removeCookie', {
                method: 'POST',
                credentials: 'include',
              });
              this.unauthenticate();
              this.$router.push('/');
            }
            return false;
        } catch (error) {
          console.error('Failed to validate session', error);
          fetch('https://localhost:3001/api/users/removeCookie', {
              method: 'POST',
              credentials: 'include',
            });
            this.unauthenticate();
            this.$router.push('/');
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
