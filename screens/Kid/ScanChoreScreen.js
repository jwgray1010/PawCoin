import React from 'react';
import QRscanner from '../../components/QRscanner';
import { AccessibilityInfo, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function ScanChoreScreen({ navigation }) {
  const handleScanned = ({ data }) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === 'chore') {
        AccessibilityInfo.announceForAccessibility('Chore QR code scanned. Accepting chore.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.replace('AcceptChoreScreen', { choreData: parsed });
      } else {
        AccessibilityInfo.announceForAccessibility('Invalid QR code for chore assignment.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Invalid QR', 'Invalid QR code for chore assignment.');
      }
    } catch {
      AccessibilityInfo.announceForAccessibility('Invalid QR code.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid QR', 'Invalid QR code.');
    }
  };

  return <QRscanner onScanned={handleScanned} onCancel={() => {
    AccessibilityInfo.announceForAccessibility('Scan cancelled.');
    navigation.goBack();
  }} />;
}