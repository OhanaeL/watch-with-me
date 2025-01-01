import { createRouter, createWebHistory } from 'vue-router';
import VideoPlayer from './pages/VideoPlayer.vue';
import HomePage from './pages/HomePage.vue';

// Set up the routes
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage, // Home page component
  },
  {
    path: '/watch',
    name: 'watch',
    component: VideoPlayer, // Video player component
  },
];

// Create and export the router
const router = createRouter({
  history: createWebHistory(), // Use HTML5 history mode for cleaner URLs
  routes,
});

export default router;
