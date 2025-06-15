import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AccessibilityInfo } from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';

export default function ResultScreen({ route, navigation }) {
  const { scannedData, walletConnectUri } = route.params || {};

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility('Result screen. Scanned data displayed.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scanned Data</Text>
      <Text style={styles.data}>{scannedData}</Text>

      {walletConnectUri && (
        <View style={styles.qrSection}>
          <Text style={styles.subtitle}>WalletConnect QR</Text>
          <QRCodeSVG value={walletConnectUri} size={200} />
          <Text style={styles.qrHint}>Scan this QR with your wallet app</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          AccessibilityInfo.announceForAccessibility('Done. Returning to previous screen.');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.goBack();
        }}
        accessibilityRole="button"
        accessibilityLabel="Done"
      >
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fffbe9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 18, color: '#0288d1' },
  data: { color: '#795548', fontSize: 16, marginBottom: 24, textAlign: 'center' },
  qrSection: { alignItems: 'center', marginBottom: 24 },
  subtitle: { fontSize: 18, fontWeight: 'bold', color: '#0288d1', marginBottom: 10 },
  qrHint: { color: '#795548', fontSize: 13, marginTop: 8, textAlign: 'center' },
  button: { backgroundColor: '#0288d1', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});