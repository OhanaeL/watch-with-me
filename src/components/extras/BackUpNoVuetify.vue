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
            @input="seekVideo"
            thumb-label
            class="progress-bar"
            hide-details
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
            <v-list-item-group v-if="playlist.length">
              <v-list-item v-for="(video, index) in playlist" :key="index">
                  <v-list-item-title>{{ video.title }}</v-list-item-title>
                  <v-list-item-action>
                    <v-btn @click="playVideoFromPlaylist(video.videoId)" color="primary" outlined>
                      Play
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
        volume: 50, // Default volume
        currentTime: 0, // Current time of the video
        videoDuration: 0, // Duration of the video
        isVideoPlaying: false, // Track if the video is playing
        isPlayerLoaded: false,
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
        this.setVolume(this.volume); // Set initial volume
        this.videoDuration = event.target.getDuration(); // Get video duration
        this.currentTime = 0; // Reset current time when a new video starts
      },
  
      onPlayerStateChange(event) {
        if (event.data === window.YT.PlayerState.PLAYING) {
          this.isVideoPlaying = true;
          this.updateProgress();
          this.videoDuration = event.target.getDuration();
        } else {
          this.isVideoPlaying = false;
        }
        if (event.data === window.YT.PlayerState.ENDED) {
          this.removeVideoFromPlaylist();
          this.playNextVideo();
        }
      },
  
      updateProgress() {
        if (this.player) {
          this.currentTime = this.player.getCurrentTime();
          if (this.player.getPlayerState() === window.YT.PlayerState.PLAYING) {
            requestAnimationFrame(this.updateProgress);
          }
        }
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
        this.videoId = match ? match[1] : null;
        if (this.videoId && !this.isInPlaylist(this.videoId)) {
          const title = this.extractVideoTitle(this.videoUrl);
          this.playlist.push({
            videoId: this.videoId,
            title,
          });
          this.videoUrl = ""; // Clear the input field
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
        this.videoId = videoId;
        this.createPlayer();
      },
  
      removeVideoFromPlaylist() {
        if (this.playlist.length > 0) {
          this.playlist.shift(); // Remove the first video from the playlist
        }
      },
  
      playNextVideo() {
        if (this.playlist.length > 0) {
          const nextVideo = this.playlist[0]; // Get the next video
          this.videoId = nextVideo.videoId;
          this.createPlayer();
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .youtube-player {
    width: 100%;
    max-width: 640px;
    height: 360px;
  }
  
  .progress-bar {
    width: 100%;
  }
  
  .volume-slider {
    width: 200px;
  }
  </style>
  