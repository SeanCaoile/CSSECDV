<template>
  <div>
    <nav class="navbar">
      <button class="logout-btn" @click="logout">Logout</button>
    </nav>
    <div class="centered">
      <h1>Welcome "ACCOUNT_NAME"</h1>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    // Access the #app element
    const appElement = document.getElementById('app');

    if (window.innerWidth > 1024) {
      appElement.style.display='block'
    }
  },
  
  methods: {
    logout() {
      this.$router.push('/');

      const appElement = document.getElementById('app');
      appElement.style.display = 'grid';
      appElement.style.gridTemplateColumns = '1fr 1fr';
      appElement.style.padding = '0 2rem';
    }
  }
}

</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 6rem; /* Increased height */
  display: flex;
  justify-content: space-between; /* Align items at the start and end */
  align-items: center;
  padding: 1rem 2rem; /* Adjusted padding */
  background-color: #333;
  color: white;
}

.logout-btn {
  background-color: #b23b3b;
  color: white;
  border: none;
  cursor: pointer;
  padding: 0.8rem 1.5rem; /* Adjusted padding */
  border-radius: 50px; /* Make button oval-shaped */
  font-size: 1.1rem; /* Adjust font size */
  margin-left: auto; /* Move button to the right */
  display: inline-block; /* Ensure button doesn't expand to full width */

  background-color: #b23b3b;
  color: white;
  border: none;
  cursor: pointer;
  padding: 0.8rem 1.5rem; /* Adjusted padding */
  border-radius: 50px; /* Make button oval-shaped */
  font-size: 1.1rem; /* Adjust font size */
  width: 150px;
  margin-left: auto;
}


.logout-btn:hover {
  text-decoration: underline;
}
</style>
