// App-wide configuration constants

export default {
  appName: 'PawCoin',
  version: '1.0.0',
  firebase: {
    // Example: fill in with your Firebase config if needed
    // apiKey: 'YOUR_API_KEY',
    // authDomain: 'YOUR_AUTH_DOMAIN',
    // projectId: 'YOUR_PROJECT_ID',
    // storageBucket: 'YOUR_STORAGE_BUCKET',
    // messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    // appId: 'YOUR_APP_ID',
  },
  ar: {
    barkleyModel: require('../assets/barkley_model.vrx'),
    anchorMarker: require('../assets/anchor_marker.vrx'),
  },
  // Add other global config as needed
};