<script setup lang="ts">
import { RouterLink, RouterView, useRoute , useRouter  } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
const route = useRoute()

// const router = useRouter()
// const refreshPageOnce = () => {
//   // Check if the page is being loaded for the first time or from the browser's history
//   if (router.history.state?.forwarded) {
//     // Reload the page if it's a direct access or rendered from the browser's history
//     window.location.reload()
//   }
// }
// import { onMounted } from 'vue'
// onMounted(refreshPageOnce)
</script>


<template>
  <header v-if="route.name === 'login' || route.name === 'register'">
    <div class="wrapper" >
      <HelloWorld msg="Welcome" />
      <nav>
        <RouterLink to="/">Login</RouterLink>
        <RouterLink to="/register">Register</RouterLink>
        
      </nav>
    </div>
  </header>

  <!-- <header v-if="route.name === 'home'"> -->
    <!-- <h1>TEST</h1> -->
  <!-- </header> -->

  <RouterView />

</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
  
}
</style>
