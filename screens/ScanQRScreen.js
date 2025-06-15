import React from 'react';
import QRscanner from '../components/QRscanner';
import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function ScanQRScreen({ navigation }) {
  const handleScanned = ({ data }) => {
    AccessibilityInfo.announceForAccessibility('QR code scanned. Showing result.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.replace('ResultScreen', { scannedData: data });
  };

  return (
    <QRscanner
      onScanned={handleScanned}
      onCancel={() => {
        AccessibilityInfo.announceForAccessibility('Scan cancelled.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        navigation.goBack();
      }}
    />
  );
}