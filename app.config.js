// Expo app configuration

export default {
  name: 'PawCoin',
  slug: 'paw_coin',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/logo.png', // changed to walletconnectlogo.png
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/logo.png', // changed from splash.png to logo2.png
    resizeMode: 'contain',
    backgroundColor: '#fffbe9',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: [
    '**/*',
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.pawcoin',
    infoPlist: {
      NSCameraUsageDescription: "This app uses the camera for AR features and QR code scanning.",
      NSPhotoLibraryUsageDescription: "This app needs access to your photo library to upload and save photos.",
      NSFaceIDUsageDescription: "Face ID is used for secure authentication.",
      UIBackgroundModes: ['fetch', 'remote-notification'],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/logo.png',
      backgroundColor: '#fffbe9',
    },
    package: 'com.yourcompany.pawcoin',
    permissions: [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "VIBRATE",
      "INTERNET",
      "RECEIVE_BOOT_COMPLETED",
      "USE_BIOMETRIC",
      "USE_FINGERPRINT",
      "FOREGROUND_SERVICE",
      "POST_NOTIFICATIONS"
    ],
  },
  web: {
    favicon: './assets/walletconnectlogo.png', // changed to walletconnectlogo.png
    themeColor: '#0288d1',
    backgroundColor: '#fffbe9',
  },
  extra: {
    eas: {
      projectId: "c908ff65-e73b-4c94-97eb-dbfb10066707"
    }
  },
};