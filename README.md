# synq

Audio visualizer for Spotify

<!-- After you push, replace the above with the actual GitHub user-attachments URL -->
<!-- To get it: create a new issue, drag your demo.mp4 into the comment, copy the URL that appears -->

## Quick Start

```bash
git clone https://github.com/yourusername/synq.git
cd synq
./setup.sh
# Edit .env with your Spotify credentials
npm start
```

Press `⌘ + Shift + V` to toggle the visualizer.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an app
3. Add redirect URI: `https://127.0.0.1:8888/callback`
4. Copy Client ID and Client Secret

### 3. Configure

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=https://127.0.0.1:8888/callback
```

### 4. Run

```bash
npm start
```

## Audio Setup

### Built-in Microphone
Works immediately. Just allow microphone access when prompted.

### BlackHole (Recommended)
For perfect audio quality without background noise:

1. Install: `brew install blackhole-2ch`
2. Open Audio MIDI Setup
3. Create Multi-Output Device → Check BlackHole + your speakers
4. Set as system output
5. Restart synq

See [AUDIO_SETUP.md](AUDIO_SETUP.md) for detailed instructions.

## Configuration

Edit `src/app/config.js`:

```javascript
window.synqConfig = {
  visualization: {
    maxRings: 5,
    baseRadius: 50,
    color: '#1DB954',
    fadeSpeed: 0.1,
  },
  audio: {
    beatThreshold: 0.05,    // Lower = more sensitive
    bassMinLevel: 0.15,
    fftSize: 2048,
    smoothing: 0.8,
  }
};
```

## Keyboard Shortcuts

- `⌘ + Shift + V` - Toggle visualizer
- `Esc` - Close window

## Tech Stack

- Electron + TypeScript
- Web Audio API for frequency analysis
- Canvas 2D rendering at 60 FPS
- Spotify Web API for track metadata

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT
