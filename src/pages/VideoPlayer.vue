<template>
    <div id="app">
      <h1>Custom YouTube Video Player</h1>
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
  
  <style>
  #app {
    font-family: Arial, sans-serif;
    text-align: center;
    margin-top: 50px;
  }
  </style>
  