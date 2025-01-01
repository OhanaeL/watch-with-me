<template>
  <v-container class="video-player">

    <!-- Input for YouTube URL -->
    <v-row>
      <v-col cols="12" md="8">
        <v-text-field
          v-model="videoUrl"
          @input="updateVideoId"
          label="Enter YouTube URL"
          outlined
          dense
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-btn @click="addToPlaylist" color="primary" block>
          Add to Playlist
        </v-btn>
      </v-col>
    </v-row>

    <!-- YouTube Player -->
    <v-row v-if="videoId">
      <v-col cols="12">
        <div id="player" class="youtube-player"></div>
      </v-col>
    </v-row>

    <!-- Custom Controls -->
    <v-row v-if="videoId" class="controls">
      <!-- Progress Bar -->
      <v-col cols="12" class="d-flex align-center">
        <v-slider
          v-model="currentTime"
          :max="videoDuration"
          thumb-label
          class="progress-bar"
          hide-details
          color="primary"
          @mousedown="startDraggingProgress"
          @mouseup="stopDraggingProgress"
          @mouseleave="stopDraggingProgress"
          @touchstart="startDraggingProgress"
          @touchend="stopDraggingProgress"
        />
        <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(videoDuration) }}</span>
      </v-col>

      <!-- Controls Row -->
      <v-col cols="4" class="d-flex justify-center align-center">
        <!-- Fullscreen Button -->
        <v-btn @click="toggleFullscreen" icon>
          <v-icon>mdi-fullscreen</v-icon>
        </v-btn>

        <!-- Play/Pause Button -->
        <v-btn @click="this.isVideoPlaying ? pauseVideo() : playVideo()" icon>
          <v-icon>{{ this.isVideoPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
        </v-btn>

          <v-btn @click="muteVideo" icon>
            <v-icon>mdi-volume-off</v-icon>
          </v-btn>
          <v-btn @click="unmuteVideo" icon>
            <v-icon>mdi-volume-high</v-icon>
          </v-btn>
          <v-slider
            v-model="volume"
            min="0"
            max="100"
            class="volume-slider"
            hide-details
          />
      </v-col>
    </v-row>

    <!-- Playlist Display -->
    <v-row v-if="playlist.length > 0">
      <v-col cols="12">
        <v-divider />
        <v-list>
          <v-list-item
            v-for="(video, index) in playlist"
            :key="index"
            :class="{
              'dragging': draggingIndex === index,
              'active-video': video.videoId === videoId
            }"
            v-bind:draggable="true"
            @dragstart="onDragStart(index)"
            @dragover.prevent
            @drop="onDrop(index)"
          >
            <v-list-item-title>{{ video.title }}</v-list-item-title>
            <v-list-item-action>
              <v-btn @click="playVideoFromPlaylist(video.videoId)" color="primary" outlined>
                Play
              </v-btn>
              <v-btn @click="removeFromPlaylist(index)" color="red" outlined>
                Remove
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>
  
<script>
export default {
  data() {
    return {
      videoUrl: "",
      videoId: null,
      playlist: [],
      player: null,
      volume: 50,
      currentTime: 0,
      videoDuration: 0,
      isVideoPlaying: false, // Track if video is playing
      isPlayerLoaded: false, // Track if video player has loaded
      isDragging: false,  // Track if the user is dragging the slider (video progress)
      draggingIndex: null, // Track if the user is dragging a video in playlist
    };
  },
  methods: {
    updateVideoId() {
      // Only update video if it's not playing or if the URL is completely new
      if (!this.isPlayerLoaded || (this.videoUrl && !this.videoId)) {
          const match = this.videoUrl.match(
          /(?:youtube\.com\/(?:.*[?&]v=|.*\/)([a-zA-Z0-9_-]{11}))|(?:youtu\.be\/([a-zA-Z0-9_-]{11}))/);
          this.videoId = match ? match[1] : null;
          
          // Create or update the player based on the new video ID
          if (this.videoId) {
          this.createPlayer();
          }
      }
    },

    createPlayer() {
      if (this.videoId && !this.player) {
        // Load YouTube IFrame API
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.onload = () => {
          window.onYouTubeIframeAPIReady = () => {
            this.initializePlayer();
          };
        };
        document.body.appendChild(script);
        this.isPlayerLoaded = true;
      } else if (this.videoId && this.player) {
        // Update the current video in the player without recreating
        this.player.loadVideoById(this.videoId);
      }
    },

    initializePlayer() {
      this.player = new window.YT.Player('player', {
        videoId: this.videoId,
        playerVars: {
          controls: 0,
          enablejsapi: 1,
          fs: 1,
        },
        events: {
          onReady: this.onPlayerReady,
          onStateChange: this.onPlayerStateChange,
        },
      });
    },

    onPlayerReady(event) {
      console.log("Player is ready:", event.target);
      this.setVolume(this.volume); // Set initial volume
      this.videoDuration = event.target.getDuration(); // Get video duration
      this.currentTime = 0; // Reset current time when a new video starts
      const iframe = event.target.getIframe();
      if (iframe) {
        iframe.setAttribute('allowfullscreen', 'true'); // Ensure fullscreen is allowed
      }
    },

    onPlayerStateChange(event) {
      if (event.data === window.YT.PlayerState.PLAYING) {
        this.updateProgress();
        this.videoDuration = event.target.getDuration(); // Update video duration when video starts playing
      }
      if (event.data === window.YT.PlayerState.ENDED) {
        this.playNextVideo(); // Play the next video
      }
    },

    updateProgress() {
    if (!this.isDragging && this.player) {
      // Update the slider position based on the current video time
      this.currentTime = this.player.getCurrentTime();
      requestAnimationFrame(this.updateProgress); // Keep updating the progress
    }
    },

    onSeekVideo() {
      if (this.player) {
        this.player.seekTo(this.currentTime, true);  // Seek the video to the currentTime
      }
    },

    startDraggingProgress() {
      this.isDragging = true;  // User started interacting with the slider
    },

    stopDraggingProgress() {
      if (this.isDragging){
        this.onSeekVideo();
      }
      this.isDragging = false;
    },

    toggleFullscreen() {
      const iframe = this.player.getIframe();
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.mozRequestFullScreen) { // Firefox
        iframe.mozRequestFullScreen();
      } else if (iframe.webkitRequestFullscreen) { // Chrome, Safari, and Opera
        iframe.webkitRequestFullscreen();
      } else if (iframe.msRequestFullscreen) { // IE/Edge
        iframe.msRequestFullscreen();
      } else {
        console.warn("Fullscreen API is not supported.");
      }
    },

    playVideo() {
      if (this.player) {
        this.player.playVideo();
        this.isVideoPlaying = true;
        console.log(this.isVideoPlaying);
      }
    },

    pauseVideo() {
      if (this.player) {
        this.player.pauseVideo();
        this.isVideoPlaying = false;
      }
    },

    stopVideo() {
      if (this.player) {
        this.player.stopVideo();
      }
    },

    muteVideo() {
      if (this.player) {
        this.player.mute();
      }
    },

    unmuteVideo() {
      if (this.player) {
        this.player.unMute();
      }
    },

    setVolume() {
      if (this.player) {
        this.player.setVolume(this.volume);
      }
    },

    addToPlaylist() {
      const match = this.videoUrl.match(
        /(?:youtube\.com\/(?:.*[?&]v=|.*\/)([a-zA-Z0-9_-]{11}))|(?:youtu\.be\/([a-zA-Z0-9_-]{11}))/);
      var videoIdPlaylist = match ? match[1] : null;

      if (videoIdPlaylist && !this.isInPlaylist(videoIdPlaylist)) {
        const videoUrl = `https://www.youtube.com/watch?v=${videoIdPlaylist}`;
        
        // Fetch video metadata using YouTube oEmbed API
        fetch(`https://www.youtube.com/oembed?url=${videoUrl}&format=json`)
          .then(response => response.json())
          .then(data => {
            const title = data.title; // Title from oEmbed response
            console.log(title);

            // Add video to playlist with fetched title
            this.playlist.push({
              videoId: videoIdPlaylist,
              url: videoUrl,
              title: title,
            });

            // Clear the input field
            this.videoUrl = "";
          })
          .catch(error => {
            console.error("Error fetching video title:", error);
          });
      }
    },

    isInPlaylist(videoId) {
      return this.playlist.some(video => video.videoId === videoId);
    },

    extractVideoTitle(url) {
      const match = url.match(
        /(?:youtube\.com\/(?:.*[?&]v=|.*\/)([a-zA-Z0-9_-]{11}))|(?:youtu\.be\/([a-zA-Z0-9_-]{11}))/);
      return match ? `Video ${match[1]}` : "Untitled Video";
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    },

    playVideoFromPlaylist(videoId) {
      this.videoId = videoId; // Update the current video ID to the one selected from the playlist
      this.createPlayer(); // Create the player for the new video
    },

    removeFromPlaylist(index) {
        this.playlist.splice(index, 1); // Remove video from playlist at given index
    },

    playNextVideo() {
      if (this.playlist.length > 0) {
        // Find the index of the current video in the playlist
        const currentIndex = this.playlist.findIndex(
          (video) => video.videoId === this.videoId
        );

        // Check if the current video is the last in the playlist
        if (currentIndex === this.playlist.length - 1) {
          // Do nothing if at the end
          return;
        }

        // Calculate the next video index
        this.videoIndex = currentIndex + 1;

        // Set the next video
        const nextVideo = this.playlist[this.videoIndex];
        this.videoId = nextVideo.videoId;

        // Create the player for the next video
        this.createPlayer();
      }
    },

    onDragStart(index) {
        this.draggingIndex = index;
    },

    onDrop(index) {
        const draggedItem = this.playlist[this.draggingIndex];
        this.playlist.splice(this.draggingIndex, 1); // Remove the item from the original position
        this.playlist.splice(index, 0, draggedItem); // Insert it at the new position
        this.draggingIndex = null; // Reset dragging index
    },
  },
};
</script>

<style scoped>
/* Highlight active video in the playlist */
.active-video {
  background-color: #f0f0f0;
  border-left: 5px solid #1976d2;
}

.volume-control {
  position: relative;
}

.volume-slider {
  width: 50px; /* Adjust to your desired width */
}


</style>