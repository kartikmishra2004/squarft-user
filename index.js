import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";

// Keep this path relative. On Windows, the automatic Expo Router transform in
// this project resolves the app directory as an absolute Metro context, which
// results in an empty route tree.
const context = require.context("./app");

export function App() {
  return <ExpoRoot context={context} />;
}

registerRootComponent(App);
