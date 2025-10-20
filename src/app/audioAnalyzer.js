class AudioAnalyzer {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.bufferLength = 0;
    this.isActive = false;
  }

  async initialize() {
    try {
      // Get list of audio devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');


      // Try to find BlackHole device
      const blackHoleDevice = audioInputs.find(device =>
        device.label.toLowerCase().includes('blackhole')
      );

      const constraints = {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      };

      // If BlackHole found, use it specifically
      if (blackHoleDevice) {
        constraints.audio.deviceId = { exact: blackHoleDevice.deviceId };
      }

      // Request audio input
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create Web Audio API context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();

      // Configure analyser
      const config = window.synqConfig?.audio || {};
      this.analyser.fftSize = config.fftSize || 2048;
      this.analyser.smoothingTimeConstant = config.smoothing || 0.8;

      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);

      // Connect microphone to analyser
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      this.isActive = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize audio analyzer:', error);
      return false;
    }
  }

  getFrequencyData() {
    if (!this.isActive || !this.analyser) {
      return null;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  // Get bass level (low frequencies)
  getBassLevel() {
    const data = this.getFrequencyData();
    if (!data) return 0;

    // Bass frequencies are typically 20-250 Hz
    // In our FFT, that's roughly the first 10% of bins
    const bassEnd = Math.floor(this.bufferLength * 0.1);
    let sum = 0;

    for (let i = 0; i < bassEnd; i++) {
      sum += data[i];
    }

    return sum / bassEnd / 255; // Normalize to 0-1
  }

  // Get mid-range level
  getMidLevel() {
    const data = this.getFrequencyData();
    if (!data) return 0;

    const midStart = Math.floor(this.bufferLength * 0.1);
    const midEnd = Math.floor(this.bufferLength * 0.4);
    let sum = 0;

    for (let i = midStart; i < midEnd; i++) {
      sum += data[i];
    }

    return sum / (midEnd - midStart) / 255;
  }

  // Get treble level (high frequencies)
  getTrebleLevel() {
    const data = this.getFrequencyData();
    if (!data) return 0;

    const trebleStart = Math.floor(this.bufferLength * 0.4);
    let sum = 0;

    for (let i = trebleStart; i < this.bufferLength; i++) {
      sum += data[i];
    }

    return sum / (this.bufferLength - trebleStart) / 255;
  }

  // Get overall volume level
  getVolumeLevel() {
    const data = this.getFrequencyData();
    if (!data) return 0;

    let sum = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      sum += data[i];
    }

    return sum / this.bufferLength / 255;
  }

  // Detect if there's a beat (bass spike)
  detectBeat(threshold = 0.5) {
    const bass = this.getBassLevel();
    return bass > threshold;
  }

  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isActive = false;
  }
}

// Export for use in visualizer
window.audioAnalyzer = new AudioAnalyzer();
