import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
// Polyfill global require via HermesInternal if it's available to avoid early-runtime errors
if (
  typeof global.require !== 'function' &&
  global.HermesInternal &&
  typeof global.HermesInternal.require === 'function'
) {
  global.require = global.HermesInternal.require;
}
registerRootComponent(App);
