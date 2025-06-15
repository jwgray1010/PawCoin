import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share, Dimensions, AccessibilityInfo } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

export default function ChoreQrCode({
  label = 'Chore QR Code',
  value = '',
  size,
  color = '#0288d1',
  onClose,
  showClose = false,
}) {
  const qrSize = size || Math.min(Dimensions.get('window').width, 320) * 0.55;

  // Accessibility: Announce QR value
  React.useEffect(() => {
    if (value) AccessibilityInfo.announceForAccessibility(`${label}: ${value}`);
  }, [label, value]);

  // Copy to clipboard
  const handleCopy = () => {
    if (!value) return;
    Clipboard.setStringAsync(value);
    Alert.alert('Copied!', 'QR code value copied to clipboard.');
  };

  // Share QR value
  const handleShare = async () => {
    if (!value) return;
    try {
      await Share.share({ message: value });
    } catch (e) {
      Alert.alert('Share failed', e.message);
    }
  };

  return (
    <View style={styles.container} accessible accessibilityLabel={`${label}, ${value}`}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        onPress={handleCopy}
        accessibilityRole="imagebutton"
        accessibilityLabel="Tap to copy QR code value"
        style={styles.qrTouchable}
      >
        <QRCode value={value || ' '} size={qrSize} color={color} backgroundColor="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleCopy} accessibilityRole="button" accessibilityLabel="Copy code">
        <Text style={styles.codeText}>{value}</Text>
      </TouchableOpacity>
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={handleShare} style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Share QR code">
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        {showClose && onClose && (
          <TouchableOpacity onPress={onClose} style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Close">
            <Text style={styles.actionText}>Close</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', margin: 24, backgroundColor: '#f9f9f9', borderRadius: 18, padding: 18, elevation: 2 },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#0288d1', textAlign: 'center' },
  qrTouchable: { borderRadius: 16, overflow: 'hidden', marginBottom: 10 },
  codeText: { marginTop: 10, color: '#888', fontSize: 13, textAlign: 'center', textDecorationLine: 'underline' },
  actionsRow: { flexDirection: 'row', marginTop: 16, justifyContent: 'center' },
  actionBtn: { marginHorizontal: 12, paddingVertical: 6, paddingHorizontal: 16, backgroundColor: '#e1f5fe', borderRadius: 10 },
  actionText: { color: '#0288d1', fontWeight: 'bold', fontSize: 15 },
});