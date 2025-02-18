const { exec } = require('child_process');

// Set minimal environment variables to reduce noise
const env = {
  ...process.env,
  EXPO_LOGGING_LEVEL: 'error',
  DEBUG: 'expo:metro:*'
};

// Start the Expo development server
const child = exec('expo start --clear', {
  env,
  stdio: 'inherit'
});

child.on('error', (error) => {
  console.error('Error starting development server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
}); 