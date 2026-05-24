// Polyfill for Supabase realtime on Hermes
if (typeof globalThis.cancelIdleCallback === "undefined") {
  globalThis.cancelIdleCallback = (id: any) => clearTimeout(id);
}
if (typeof globalThis.requestIdleCallback === "undefined") {
  globalThis.requestIdleCallback = (cb: any) =>
    setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 1) as any;
}

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
