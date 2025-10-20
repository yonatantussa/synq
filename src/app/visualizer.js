class Visualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    // Load config
    const config = window.synqConfig?.visualization || {};

    this.pulseRings = [];
    this.maxRings = config.maxRings || 5;
    this.baseRadius = config.baseRadius || 50;
    this.color = config.color || '#1DB954';
    this.fadeSpeed = config.fadeSpeed || 0.1;
    this.lastBassLevel = 0;

    this.isPlaying = false;
    this.audioMode = false; // Will switch to true when audio analyzer is ready

    // Bind methods
    this.render = this.render.bind(this);
    this.update = this.update.bind(this);
    this.audioUpdate = this.audioUpdate.bind(this);

    // Initialize audio analyzer
    this.initAudio();

    // Start render loop
    this.startRenderLoop();

    // Start update loop (check Spotify every 1s)
    setInterval(this.update, 1000);
  }

  async initAudio() {
    if (window.audioAnalyzer) {
      const success = await window.audioAnalyzer.initialize();
      if (success) {
        this.audioMode = true;
        this.startAudioLoop();
      }
    }
  }

  startAudioLoop() {
    const update = () => {
      if (this.audioMode && this.isPlaying) {
        this.audioUpdate();
      }
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  audioUpdate() {
    const analyzer = window.audioAnalyzer;
    if (!analyzer || !analyzer.isActive) return;

    const config = window.synqConfig?.audio || {};
    const beatThreshold = config.beatThreshold || 0.05;
    const bassMinLevel = config.bassMinLevel || 0.15;

    const bassLevel = analyzer.getBassLevel();
    const volumeLevel = analyzer.getVolumeLevel();

    // Detect bass hits (beat detection)
    const bassDiff = bassLevel - this.lastBassLevel;
    if (bassDiff > beatThreshold && bassLevel > bassMinLevel) {
      this.addPulseRing(bassLevel);
    }

    this.lastBassLevel = bassLevel;
  }

  startRenderLoop() {
    const animate = () => {
      this.render();
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  async update() {
    const client = window.spotifyClient;
    if (!client) return;

    const trackInfo = await client.getCurrentTrack();

    if (!trackInfo) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = trackInfo.is_playing;

    if (!this.isPlaying) {
      return;
    }

    // Color could be extracted from album art in the future
    // this.color = client.getAlbumArtColor();
  }

  addPulseRing(intensity = 0.5) {
    // Remove oldest ring if at max
    if (this.pulseRings.length >= this.maxRings) {
      this.pulseRings.shift();
    }

    // Scale based on audio intensity
    const speedVariation = 0.5 + intensity * 1.5;
    const radiusVariation = this.baseRadius + (intensity * 30);

    this.pulseRings.push({
      radius: radiusVariation,
      opacity: 1.0,
      maxRadius: Math.min(this.width, this.height) * (0.6 + intensity * 0.3),
      speed: 2.5 * speedVariation
    });
  }

  render() {
    // Clear canvas with fade effect
    this.ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeSpeed})`;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Update and draw pulse rings
    for (let i = this.pulseRings.length - 1; i >= 0; i--) {
      const ring = this.pulseRings[i];

      // Update ring
      ring.radius += ring.speed;
      ring.opacity -= 0.01;

      // Remove if faded out
      if (ring.opacity <= 0 || ring.radius >= ring.maxRadius) {
        this.pulseRings.splice(i, 1);
        continue;
      }

      // Draw ring
      this.ctx.strokeStyle = this.hexToRgba(this.color, ring.opacity);
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, ring.radius, 0, Math.PI * 2);
      this.ctx.stroke();

      // Draw filled circle with lower opacity
      this.ctx.fillStyle = this.hexToRgba(this.color, ring.opacity * 0.1);
      this.ctx.fill();
    }

    // Draw center dot
    if (this.isPlaying) {
      this.ctx.fillStyle = this.color;
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, 5, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }
}

// Initialize when DOM is ready
let visualizer;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas');
  visualizer = new Visualizer(canvas);

  // Handle resize
  window.addEventListener('resize', () => {
    visualizer.resize();
  });

  // Handle escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const { ipcRenderer } = require('electron');
      ipcRenderer.send('close-window');
    }
  });
});
