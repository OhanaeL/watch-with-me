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
        <v-col cols="12" md="6" class="d-flex align-center">
          <!-- Progress Bar -->
          <v-slider
            v-model="currentTime"
            :max="videoDuration"
            thumb-label
            class="progress-bar"
            hide-details
            color="primary"
            @mousedown="startDragging"
            @mouseup="stopDragging"
            @mouseleave="stopDragging"
            @touchstart="startDragging"
            @touchend="stopDragging"
            />
          <v-spacer />
          <span>{{ formatTime(currentTime) }} / {{ formatTime(videoDuration) }}</span>
        </v-col>
        <v-col cols="12" md="6" class="d-flex justify-center">
          <!-- Play, Pause, Stop, Mute, Unmute Buttons -->
          <v-btn @click="playVideo" icon>
            <v-icon>mdi-play</v-icon>
          </v-btn>
          <v-btn @click="pauseVideo" icon>
            <v-icon>mdi-pause</v-icon>
          </v-btn>
          <v-btn @click="stopVideo" icon>
            <v-icon>mdi-stop</v-icon>
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
            @input="setVolume"
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
  <v-list-item-group>
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
  </v-list-item-group>
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
      isVideoPlaying: false,
      isPlayerLoaded: false,
      isDragging: false,  // Track if the user is dragging the slider
      draggingIndex: null,
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
      },
  
      onPlayerStateChange(event) {
        if (event.data === window.YT.PlayerState.PLAYING) {
          this.isVideoPlaying = true;  // Set to true when the video is playing
          this.updateProgress();
          this.videoDuration = event.target.getDuration(); // Update video duration when video starts playing
        } else {
          this.isVideoPlaying = false; // Set to false when video is paused/stopped
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

    // Handle the user seeking to a specific time in the video
    onSeekVideo() {
    console.log(this.currentTime)
      if (this.player) {
        console.log(this.currentTime)
        this.player.seekTo(this.currentTime, true);  // Seek the video to the currentTime
      }
    },

    // Start dragging the slider
    startDragging() {
      this.isDragging = true;  // User started interacting with the slider
    },

    // Stop dragging the slider
    stopDragging() {
        if (this.isDragging){
            
      this.onSeekVideo();
        }
      this.isDragging = false;  // User stopped interacting with the slider
    },
  
      playVideo() {
        if (this.player) {
          this.player.playVideo();
        }
      },
  
      pauseVideo() {
        if (this.player) {
          this.player.pauseVideo();
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
  
      seekVideo() {
        if (this.player) {
          this.player.seekTo(this.currentTime, true);
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
            const nextVideo = this.playlist[0]; // Get the next video in the playlist
            this.videoId = nextVideo.videoId;
            this.createPlayer(); // Create the player for the next video
            }
        },


        onDragStart(index) {
            this.draggingIndex = index;
        },

        // Method to handle the drop action
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
    background-color: #f0f0f0; /* Light gray background */
    border-left: 5px solid #1976d2; /* Blue left border */
  }
    .video-player {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 20px;
    }
  
    .video-input {
      width: 80%;
      padding: 10px;
      font-size: 16px;
      margin-bottom: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  
    .add-button {
      padding: 10px;
      font-size: 16px;
      cursor: pointer;
    }
  
    .controls {
      margin-top: 10px;
      display: flex;
      justify-content: space-around;
      width: 100%;
    }
  
    .controls button {
      padding: 10px;
      font-size: 16px;
      cursor: pointer;
    }
  
    .volume-slider {
      width: 200px;
    }
  
    .progress-container {
      width: 80%;
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  
    .progress-bar {
      width: 100%;
    }
  
    .youtube-player {
      width: 100%;
      max-width: 640px;
      height: 360px;
    }
  
    .playlist {
      margin-top: 20px;
    }
  
    .playlist ul {
      list-style-type: none;
      padding: 0;
    }
  
    .playlist li {
      margin-bottom: 10px;
    }
  </style>
  