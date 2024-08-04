<template>
  <div class="edit-blog">
    <h2>Edit Blog Post</h2>
    <div v-if="isAuthor">
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="title">Title:</label>
          <input type="text" id="title" v-model="blog.title" maxlength="30" autocomplete="off" required @input="validateTitle" />
          <small>{{ titleRemainingChars }} characters remaining</small>
          <span v-if="titleError" class="error">{{ titleError }}</span>
        </div>
        <div class="form-group">
          <label for="content">Content:</label>
          <textarea id="content" v-model="blog.content" maxlength="500" autocomplete="off" required @input="validateContent"></textarea>
          <small>{{ contentRemainingChars }} characters remaining</small>
          <span v-if="contentError" class="error">{{ contentError }}</span>
        </div>
        <div class="buttons-container">
          <button type="button" @click="cancelEdit">Cancel</button>
          <button type="submit">Update Blog</button>
        </div>
      </form>
    </div>
    <span v-else>You are not authorized to edit this blog.</span>
  </div>
</template>

<script>
import { setAppStylesForEditBlog } from '../utils/stylesUtils';

export default {
  data() {
    return {
      blog: {
        id: '',
        title: '',
        content: '',
        authorID: '',
      },
      currentUser: null,
      isAuthor: false,
      titleError: '',
      contentError: ''
    };
  },
  created() {
    this.fetchBlog();
    this.fetchCurrentUser();
    setAppStylesForEditBlog();
  },
  methods: {
    async fetchBlog() {
      try {
        const blogID = this.$route.params.blogID;
        const response = await fetch(`https://localhost:3001/api/blogs/${blogID}`);
        if (!response.ok) {
          throw new Error('Failed to fetch blog');
        }
        const data = await response.json();
        this.blog.id = data.blogID;
        this.blog.title = data.title;
        this.blog.content = data.content;
        this.blog.authorID = data.authorID;
        this.checkAuthorization();
      } catch (error) {
        console.error('Error fetching blog:', error);
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
        console.error('Error fetching current user:', error);
      }
    },
    checkAuthorization() {
      this.isAuthor = this.currentUser && this.blog.authorID === this.currentUser.id;
    },
    validateTitle() {
      const titlePattern = /^[A-Za-z0-9\s]{1,30}$/;
      if (!titlePattern.test(this.blog.title)) {
        this.titleError = 'Title must be alphanumeric and up to 30 characters long';
        return false;
      } else {
        this.titleError = '';
        return true;
      }
    },
    validateContent() {
      if (this.blog.content.length > 500) {
        this.contentError = 'Content must be up to 500 characters long';
        return false;
      } else {
        this.contentError = '';
        return true;
      }
    },
    async submitForm() {
      const isTitleValid = this.validateTitle();
      const isContentValid = this.validateContent();

      if (!isTitleValid || !isContentValid) {
        return;
      }

      try {
        const blogID = this.blog.id;
        const response = await fetch(`https://localhost:3001/api/blogs/${blogID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.blog)
        });
        if (!response.ok) {
          throw new Error('Failed to update blog');
        }
        this.$router.push(`/blogs/${blogID}`);
      } catch (error) {
        console.error('Error updating blog:', error);
      }
    },
    cancelEdit() {
      const blogID = this.blog.id;
      this.$router.push(`/blogs/${blogID}`);
    }
  },
  computed: {
    titleRemainingChars() {
      return 30 - this.blog.title.length;
    },
    contentRemainingChars() {
      return 500 - this.blog.content.length;
    }
  }
};
</script>

<style scoped>
.edit-blog {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #000;
  color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 1rem;
  color: #fff;
}

.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #fff;
}

input[type='text'],
textarea {
  width: 100%;
  max-width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

textarea {
  resize: vertical;
  min-height: 150px;
}

small {
  color: #ccc;
  margin-top: 0.25rem;
}

.buttons-container {
  display: flex;
  justify-content: space-between;
  max-width: 100%;
  margin: 1rem auto 0;
}

button {
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
  margin: 0 10px;
}

button[type='button'] {
  background-color: #6c757d;
}

button:hover {
  background-color: #0056b3;
}

button[type='button']:hover {
  background-color: #5a6268;
}

.error {
  color: red;
}
</style>
