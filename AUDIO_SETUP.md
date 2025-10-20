#  Audio-Reactive Mode Setup

synq can visualize the audio playing with by analyzing the frequency.

## Quick Start (Built-in Microphone)

**Easiest option** - works immediately:

1. Launch synq: `npm start`
2. Press `⌘ + Shift + V`
3. **Allow microphone access** when prompted
4. Play Spotify with volume up
5. Watch it react to the music! 

**Note:** This picks up audio through your microphone, so it works best with speakers or high volume.

---

## Advanced Setup: BlackHole (Recommended)

For **perfect audio capture** without needing speakers, install BlackHole to route system audio:

### Step 1: Install BlackHole

```bash
brew install blackhole-2ch
```

Or download from: https://existential.audio/blackhole/

### Step 2: Create Multi-Output Device

1. Open **Audio MIDI Setup** (Spotlight → "Audio MIDI Setup")
2. Click the **+** button (bottom left) → **Create Multi-Output Device**
3. Check both:
   -  **BlackHole 2ch**
   -  **Your speakers/headphones** (so you can hear the music)
4. Rename it to "synq Output"

### Step 3: Create Aggregate Device

1. In Audio MIDI Setup, click **+** → **Create Aggregate Device**
2. Check:
   -  **BlackHole 2ch**
3. Rename it to "synq Input"

### Step 4: Configure macOS Audio

1. Open **System Settings** → **Sound**
2. **Output**: Select "synq Output" (the Multi-Output Device)
3. This routes audio to both your speakers AND BlackHole

### Step 5: Configure synq

1. Launch synq
2. When prompted for microphone access, **Allow**
3. In the browser permission dialog, select **"synq Input"** as the audio source
4. Done! Now synq captures system audio directly

---

## How It Works

**Microphone Mode:**
- Uses `getUserMedia()` to capture audio input
- Analyzes frequencies in real-time
- Detects bass hits for pulse triggers

**BlackHole Mode:**
- Routes Spotify audio through virtual device
- Perfect capture without background noise
- No need for loud speakers

**Visualization:**
- **Bass detection** → Triggers pulse rings
- **Bass intensity** → Ring size and speed

---

## Switching Between Modes

**Use Microphone** (default):
- Works out of the box
- Just allow mic permission

**Use BlackHole** (better quality):
- Follow setup above
- Select "synq Input" when synq requests audio access
- Perfect for quiet environments

---

Enjoy your real-time, audio-reactive Spotify visualizer! 
