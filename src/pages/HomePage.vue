<template>
    <div class="home">
      <h1>Welcome to the Custom YouTube Video Player</h1>
      <p>Click the button below to go to the video player page.</p>
      <router-link to="/watch">
        <button>Go to Video Player</button>
      </router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HomePage',
  };
  </script>
  
  <style scoped>
  .home {
    text-align: center;
  }
  </style>
  