// Firebase initialization and exports for React Native Firebase

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import app from '@react-native-firebase/app';
import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

// No manual initialization is needed; config is handled by native files (google-services.json & GoogleService-Info.plist)

// Helper: Announce Firebase connection
export const announceFirebaseConnected = () => {
  AccessibilityInfo.announceForAccessibility('Connected to Firebase.');
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export { app, auth, firestore };