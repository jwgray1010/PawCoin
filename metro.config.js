const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  config.transformer.babelTransformerPath = require.resolve('expo-svg-transformer');
  config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
  config.resolver.sourceExts.push('svg');
  // Support for .glb and .gltf 3D model assets
  config.resolver.assetExts.push('glb', 'gltf');
  return config;
})();