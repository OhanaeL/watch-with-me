<template>
  <div class="home">
    <h1>Welcome to the Custom YouTube Video Player</h1>
    <p>Click the button below to go to the video player page.</p>
    <router-link to="/watch">
      <button class="cta-button">Go to Video Player</button>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  color: #1976d2;
  margin-bottom: 20px;
}

p {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 30px;
}

.cta-button {
  background-color: #1976d2;
  color: white;
  font-size: 1.1rem;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cta-button:hover {
  background-color: #1565c0;
}

.cta-button:focus {
  outline: none;
}
</style>
