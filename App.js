import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import React from 'react';
import AppInner from './src/App'; // Avoid naming conflict
import { AuthProvider } from './contexts/AuthContext';
import * as Haptics from 'expo-haptics';
import { AccessibilityInfo } from 'react-native';
import { decode, encode } from 'base-64';
import { ViroARSceneNavigator } from '@viro-community/react-viro';

if (!global.btoa) { global.btoa = encode; }
if (!global.atob) { global.atob = decode; }

export default function App() {
  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility('PawCoin app loaded.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <AuthProvider>
      <AppInner />
      <ViroARSceneNavigator
        initialScene={{ scene: require('./MyARScene') }}
        style={{ flex: 1 }}
      />
    </AuthProvider>
  );
}