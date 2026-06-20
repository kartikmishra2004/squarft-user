const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require("path");

const config = getDefaultConfig(__dirname)

config.resolver.unstable_enablePackageExports = false;
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@livekit/react-native": path.resolve(__dirname, "node_modules/@livekit/react-native"),
  "@livekit/react-native-webrtc": path.resolve(__dirname, "node_modules/@livekit/react-native-webrtc"),
  "livekit-client": path.resolve(__dirname, "node_modules/livekit-client"),
};

module.exports = withNativeWind(config, { input: './global.css' })
