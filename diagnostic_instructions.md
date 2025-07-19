# Diagnostic Instructions for Expo React Native Apps

This guide provides step-by-step instructions to diagnose and debug common issues when running an Expo React Native application in Expo Go.

---

## 1. Check the Metro/DevServer Console

Errors in your JavaScript code typically show up in the Metro bundler terminal or in the in-app error overlay:

```bash
expo start
# or npm start / yarn start
```

- Watch the terminal for stack traces or bundler errors (e.g., “Cannot find module” or syntax errors).
- In the Expo Go app, shake your device (or press `d` in the terminal) to open the error overlay.

## 2. Verify Your Entry Point & Exports

Ensure your project has a proper entry file (typically `index.js` or `index.ts`) that registers the root component:

```js
// index.js
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

In `App.js` (or `App.tsx`), make sure your component is exported correctly:

```js
export default function App() {
  return (
    <View>
      <Text>Hello, world!</Text>
    </View>
  );
}
```

## 3. Look for Unhandled Exceptions in Your Code

Common runtime issues include:
- Typo in JSX or wrong import paths.
- Accessing properties on `undefined` or `null`.
- Uncaught exceptions in async functions or `useEffect` hooks.

Wrap async code in `try/catch` blocks or add `.catch()` to Promises to ensure errors surface clearly:

```js
useEffect(() => {
  async function loadData() {
    try {
      const data = await fetchData();
      setState(data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }
  loadData();
}, []);
```

## 4. Check SDK Version Compatibility

An SDK mismatch between your project and Expo Go can cause runtime failures:

```bash
expo diagnostics
```

- Verify the `sdkVersion` in `app.json` or `app.config.js` matches the installed Expo CLI and Expo Go versions.
- If mismatched, upgrade/downgrade your project or install a compatible Expo Go build.

## 5. Clear Caches & Reinstall Dependencies

Clean caches and reinstall modules to rule out stale artifacts:

```bash
rm -rf .expo metro-cache node_modules
npm install   # or yarn install
expo start -c # clear Metro's cache
```

## 6. Gather More Information

If the issue persists, collect and share the following:

1. Exact error messages and stack traces from the terminal or Expo DevTools.
2. Contents of your entry files (`index.js` / `App.js`).
3. Snippets of code around the suspected crash area.
4. Your `package.json`, highlighting the Expo SDK version and dependencies.
5. Any recent changes made before the breakage.

With these details, you can pinpoint the root cause or share them with teammates for faster assistance.
