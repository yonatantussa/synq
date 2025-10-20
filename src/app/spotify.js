class SpotifyClient {
  constructor() {
    this.currentTrack = null;
    this.audioAnalysis = null;
    this.beats = [];
    this.startTime = 0;
  }

  async getCurrentTrack() {
    const { ipcRenderer } = require('electron');

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${await this.getAccessToken()}`
        }
      });

      if (response.status === 204 || !response.ok) {
        return null;
      }

      const data = await response.json();

      if (!data || !data.item) {
        return null;
      }

      // Check if track changed
      if (!this.currentTrack || this.currentTrack.id !== data.item.id) {
        this.currentTrack = data.item;
        this.startTime = Date.now() - (data.progress_ms || 0);
      }

      return {
        track: data.item,
        progress_ms: data.progress_ms,
        is_playing: data.is_playing
      };
    } catch (error) {
      console.error('Failed to fetch current track:', error);
      return null;
    }
  }

  async getAccessToken() {
    return window.spotifyAccessToken;
  }
}

// Export for use in visualizer
window.spotifyClient = new SpotifyClient();
