const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = mergeConfig(getDefaultConfig(__dirname), {
  transformer: {
    babelTransformerPath: require.resolve('react-native-css-transformer')
  },
  resolver: {
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'css', 'json'],
  }
});

module.exports = withNativeWind(config, { input: './global.css' });