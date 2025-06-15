import React, { useEffect } from 'react';
import QRCodeSVG from 'react-native-qrcode-svg';
import { View, StyleSheet, TouchableOpacity, Alert, Share, Text, Dimensions, AccessibilityInfo } from 'react-native';
import * as Clipboard from 'expo-clipboard';

// Example usage in a screen or modal
// import QRCode from '../components/QRCode';

export default function ShowQRScreen({ route }) {
  const { data } = route.params;
  return (
    <QRCode value={data} />
  );
}

/**
 * QRCode component with accessibility, copy, and share features.
 * @param {object} props
 * @param {string} props.value - The value to encode in the QR code.
 * @param {number} [props.size] - Optional size of the QR code.
 * @param {string} [props.color] - Optional color for the QR code.
 * @param {string} [props.label] - Optional label for accessibility.
 */
export function QRCode({ value = '', size, color = '#0288d1', label = 'QR Code' }) {
  const qrSize = size || Math.min(Dimensions.get('window').width, 320) * 0.55;

  // Accessibility: Announce QR value
  useEffect(() => {
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
      <TouchableOpacity
        onPress={handleCopy}
        accessibilityRole="imagebutton"
        accessibilityLabel="Tap to copy QR code value"
        style={styles.qrTouchable}
      >
        <QRCodeSVG value={value || ' '} size={qrSize} color={color} backgroundColor="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleCopy} accessibilityRole="button" accessibilityLabel="Copy code">
        <Text style={styles.codeText}>{value}</Text>
      </TouchableOpacity>
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={handleShare} style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Share QR code">
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#f9f9f9', borderRadius: 18 },
  qrTouchable: { borderRadius: 16, overflow: 'hidden', marginBottom: 10 },
  codeText: { marginTop: 10, color: '#888', fontSize: 13, textAlign: 'center', textDecorationLine: 'underline' },
  actionsRow: { flexDirection: 'row', marginTop: 16, justifyContent: 'center' },
  actionBtn: { marginHorizontal: 12, paddingVertical: 6, paddingHorizontal: 16, backgroundColor: '#e1f5fe', borderRadius: 10 },
  actionText: { color: '#0288d1', fontWeight: 'bold', fontSize: 15 },
});