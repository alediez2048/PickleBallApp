const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// 1. Configure path resolution
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// 2. Configure module name mapper for path aliases
config.resolver.alias = {
  '@': path.resolve(projectRoot, 'src'),
  '@components': path.resolve(projectRoot, 'src/components'),
  '@hooks': path.resolve(projectRoot, 'src/hooks'),
  '@services': path.resolve(projectRoot, 'src/services'),
  '@contexts': path.resolve(projectRoot, 'src/contexts'),
  '@constants': path.resolve(projectRoot, 'src/constants'),
  '@types': path.resolve(projectRoot, 'src/types'),
  '@utils': path.resolve(projectRoot, 'src/utils'),
};

// 3. Configure asset handling
config.resolver.assetExts = [...config.resolver.assetExts, 'db', 'sqlite'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// 4. Enable symlinks for monorepo support
config.resolver.enableSymlinks = true;

// 5. Basic logging configuration
config.reporter = {
  update: () => {}, // Suppress update messages
  log: (message) => {
    if (message.includes('error') || message.includes('Error')) {
      console.error(message);
    }
  }
};

module.exports = config; 