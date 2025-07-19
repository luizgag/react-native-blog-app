const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for Hermes engine compatibility
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

// Ensure proper handling of TypeScript files
config.resolver.sourceExts.push('ts', 'tsx');

// Hermes-compatible transformer options
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
  // Fix for Hermes require issues
  hermesParser: true,
};

// Additional resolver configuration for Hermes
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;