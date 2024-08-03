<template>
  <div class="create-blog">
    <h2>Create a New Blog</h2>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="title">Title:</label>
        <input type="text" id="title" v-model="blog.title" maxlength="30" required @input="validateTitle" />
        <small>{{ titleRemainingChars }} characters remaining</small>
        <span v-if="titleError" class="error">{{ titleError }}</span>
      </div>
      <div class="form-group">
        <label for="content">Content:</label>
        <textarea id="content" v-model="blog.content" maxlength="500" required @input="validateContent"></textarea>
        <small>{{ contentRemainingChars }} characters remaining</small>
        <span v-if="contentError" class="error">{{ contentError }}</span>
      </div>
      <button type="submit">Create Blog</button>
    </form>
  </div>
</template>

<script>
import { resetAppStyles, setAppStylesForHome } from '../utils/stylesUtils';

export default {
  data() {
    return {
      blog: {
        blogID: Date.now(),
        title: '',
        content: '',
        authorID: '',
        authorEmail: '',
        dateCreated: new Date().toISOString().slice(0, 19).replace('T', ' ')
      },
      titleError: '',
      contentError: ''
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
  created() {
    this.fetchCurrentUser();
  },
  methods: {
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
          const text = await response.text();
          console.error('Error fetching current user:', text);
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.authenticated) {
          this.blog.authorID = data.id;
          this.blog.authorEmail = data.email;
        } else {
          console.error('User is not authenticated');
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
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
        const response = await fetch('https://localhost:3001/api/createBlog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.blog)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        const data = await response.json();
        console.log('Blog created successfully:', data);
        this.$router.push('/home');
      } catch (error) {
        console.error('There was an error creating the blog:', error);
      }
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
          return response.text().then(text => {
            console.error('Failed to validate session:', text);

            fetch('https://localhost:3001/api/users/removeCookie', {
              method: 'POST',
              credentials: 'include',
            });
            this.unauthenticate();
            this.$router.push('/');

            throw new Error('Failed to validate session');
          });
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
.create-blog {
  width: 600px;
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: black;
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
  font-size: 1.1rem;
}

input[type='text'] {
  height: 2.5rem;
}

textarea {
  height: 250px;
}

small {
  color: #ccc;
  margin-top: 0.25rem;
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

.error {
  color: red;
}
</style>
