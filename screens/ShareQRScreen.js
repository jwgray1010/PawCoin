import React from 'react';
import { View, Text, TouchableOpacity, Share, StyleSheet, AccessibilityInfo } from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';

export default function ShareQRScreen({ route }) {
  const { data } = route.params; // e.g., userId, wallet address, etc.

  const handleShare = () => {
    AccessibilityInfo.announceForAccessibility('Share link button pressed.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Share.share({
      message: `Scan this QR to connect: ${data}`,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Show this QR code</Text>
      <QRCodeSVG value={data} size={200} />
      <TouchableOpacity style={styles.button} onPress={handleShare} accessibilityRole="button" accessibilityLabel="Share Link">
        <Text style={styles.buttonText}>Share Link</Text>
      </TouchableOpacity>
      <Text style={styles.info}>{data}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fffbe9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 18, color: '#0288d1' },
  button: { marginTop: 24, backgroundColor: '#0288d1', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  info: { marginTop: 18, color: '#795548', fontSize: 14, textAlign: 'center' },
});