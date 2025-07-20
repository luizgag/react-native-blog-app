const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// This disables the new package-exports resolver which breaks require polyfill for Hermes
config.resolver.unstable_enablePackageExports = false;

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
  // Disable inline requires via getTransformOptions to avoid Hermes "require not ready" errors
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
};

// Additional resolver configuration for Hermes
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
