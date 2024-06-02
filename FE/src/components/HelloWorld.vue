<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      Sign in to continue
    </h3>
  </div>
</template>

<script setup lang="ts">
// import { ref, onMounted } from 'vue';

// Define props
defineProps<{
  msg: string
}>();

//-------------------code no needed here but can use as reference elsewhere------------------------

// Define reactive variables
// const users = ref([]);

// // Fetch users function
// const fetchUsers = async () => {
//   try {
//     const response = await fetch('http://localhost:3001/api/users/showUsers');
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     users.value = await response.json();
//   } catch (error) {
//     console.error('There was a problem with the fetch operation:', error);
//   }
// };

// Fetch users when component is mounted
// onMounted(fetchUsers);
</script>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

/* .greetings h1,
.greetings h3 {
  text-align: center;
} */

/* @media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
} */

</style>