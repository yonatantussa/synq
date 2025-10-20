#!/bin/bash

echo " synq Setup Script"
echo "===================="
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo " .env file already exists"
else
    echo " Creating .env file from template..."
    cp .env.example .env
    echo " .env file created"
    echo ""
    echo "  IMPORTANT: Edit .env and add your Spotify credentials!"
    echo "   Get them from: https://developer.spotify.com/dashboard"
    echo ""
fi

# Install dependencies
echo " Installing dependencies..."
npm install

# Build
echo " Building application..."
npm run build

echo ""
echo " Setup complete!"
echo ""
echo " Next steps:"
echo "   1. Edit .env with your Spotify credentials (if you haven't already)"
echo "   2. Run: npm start"
echo "   3. Press ⌘+Shift+V to open visualizer"
echo ""
