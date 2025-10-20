# Contributing to synq

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/YOUR_USERNAME/synq.git
   cd synq
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up Spotify credentials** (see README.md)
5. **Build and test**
   ```bash
   npm run build
   npm start
   ```

## Development Workflow

### Making Changes

1. **Create a new branch** for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style below

3. **Test your changes** thoroughly
   - Run `npm run build` to check for TypeScript errors
   - Test the app with `npm start`
   - Try different types of music (electronic, hip-hop, classical)

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: brief description of your changes"
   ```
   
## Feature Ideas

### Visualizations
- [ ] Multiple visualization modes (waveform, bars, particles, etc.)
- [ ] Color schemes based on album artwork
- [ ] Visualizer presets (e.g., chill, energetic, minimal)
- [ ] Frequency color mapping
