const { exec } = require('child_process');
const path = require('path');

// Set environment variables to reduce noise
process.env.EXPO_LOGGING_LEVEL = 'error';
process.env.DEBUG = 'expo:metro:*';

// Start the Expo development server with reduced logging
exec('expo start --clear', {
  stdio: 'inherit',
  env: {
    ...process.env,
    EXPO_LOGGING_LEVEL: 'error',
    DEBUG: 'expo:metro:*'
  }
}, (error) => {
  if (error) {
    console.error('Error starting development server:', error);
    process.exit(1);
  }
}); 