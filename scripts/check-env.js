#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const envExamplePath = path.join(__dirname, '../.env.example');

console.log('Checking environment setup...\n');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found!');
  console.log('\nTo fix this:');
  console.log('   1. Copy .env.example to .env:');
  console.log('      cp .env.example .env\n');
  console.log('   2. Edit .env and add your Spotify credentials');
  console.log('   3. Get credentials from: https://developer.spotify.com/dashboard\n');
  process.exit(1);
}

// Read and validate .env
const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');
const config = {};

lines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, value] = trimmed.split('=');
    if (key && value) {
      config[key.trim()] = value.trim();
    }
  }
});

let hasErrors = false;

// Check required variables
const required = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SPOTIFY_REDIRECT_URI'];

required.forEach(key => {
  if (!config[key]) {
    console.error(`❌ Missing: ${key}`);
    hasErrors = true;
  } else if (config[key].includes('your_') || config[key].includes('_here')) {
    console.error(`❌ ${key} has placeholder value, please update it`);
    hasErrors = true;
  } else {
    console.log(`✅ ${key} configured`);
  }
});

if (hasErrors) {
  console.log('\nPlease update your .env file with actual Spotify credentials');
  console.log('Get them from: https://developer.spotify.com/dashboard\n');
  process.exit(1);
}

console.log('\nEnvironment setup looks good!');
console.log('You can now run: npm start\n');
