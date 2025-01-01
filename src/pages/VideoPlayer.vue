<template>
  <div id="app">
    <div class="header">
      <h1>Custom YouTube Video Player</h1>
    </div>
    <VideoPlayer />
  </div>
</template>

<script>
import VideoPlayer from "../components/MainVideoPlayer.vue";

export default {
  components: {
    VideoPlayer,
  },
};
</script>

<style scoped>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  background-color: #f4f7f6;
}

.header {
  background-color: #1976d2;
  color: white;
  width: 100%;
  padding: 20px 0;
  text-align: center;
  border-bottom: 4px solid #1565c0;
}

h1 {
  font-size: 2.5rem;
  margin: 0;
}

VideoPlayer {
  margin-top: 30px;
  width: 100%;
  max-width: 900px;
  padding: 10px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

</style>
