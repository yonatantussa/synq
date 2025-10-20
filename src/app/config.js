// synq Configuration
// Customize visualization settings here

window.synqConfig = {
  // Visualization settings
  visualization: {
    maxRings: 5,              // Maximum number of rings on screen
    baseRadius: 50,           // Starting radius of rings (pixels)
    color: '#1DB954',         // Ring color (Spotify green)
    fadeSpeed: 0.1,           // Canvas fade effect (0.0 - 1.0)
  },

  // Audio detection settings
  audio: {
    beatThreshold: 0.05,      // Sensitivity for bass spike detection (lower = more sensitive)
    bassMinLevel: 0.15,       // Minimum bass level to trigger (0.0 - 1.0)
    fftSize: 2048,            // FFT size for frequency analysis
    smoothing: 0.8,           // Analyser smoothing (0.0 - 1.0)
  },

  // Window settings
  window: {
    width: 1200,
    height: 800,
    alwaysOnTop: false,
  },

  // Keyboard shortcut (restart required to change)
  shortcut: 'CommandOrControl+Shift+V'
};
