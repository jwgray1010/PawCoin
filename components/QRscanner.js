import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, AccessibilityInfo, Dimensions } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Haptics from 'expo-haptics';

export default function QRscanner({ onScanned, onCancel, showSkip = false, onSkip }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  // Responsive overlay
  const { width } = Dimensions.get('window');
  const overlayWidth = Math.min(width * 0.8, 320);

  // Request camera permission on mount
  React.useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        AccessibilityInfo.announceForAccessibility('No access to camera');
      }
    })();
  }, []);

  // Handle QR/barcode scan
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    AccessibilityInfo.announceForAccessibility(`QR code scanned: ${data}`);
    if (onScanned) {
      onScanned({ type, data });
    } else {
      Alert.alert('QR Code Scanned', data, [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0288d1" />
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={() => setHasPermission(null)} accessibilityRole="button" accessibilityLabel="Try Again">
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
        {showSkip && onSkip && (
          <TouchableOpacity style={styles.skipBtn} onPress={onSkip} accessibilityRole="button" accessibilityLabel="Skip">
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.overlay, { width: overlayWidth }]}>
        <Text style={styles.instructions} accessibilityRole="header">
          Scan a QR code
        </Text>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel">
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        {showSkip && onSkip && (
          <TouchableOpacity style={styles.skipBtn} onPress={onSkip} accessibilityRole="button" accessibilityLabel="Skip">
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
        {scanned && (
          <TouchableOpacity style={styles.button} onPress={() => setScanned(false)} accessibilityRole="button" accessibilityLabel="Scan Again">
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: {
    position: 'absolute',
    top: 60,
    left: '10%',
    right: '10%',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 18,
    padding: 18,
  },
  instructions: {
    fontSize: 20,
    color: '#fff',
    backgroundColor: '#0288d1',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
    fontWeight: 'bold',
    overflow: 'hidden',
    textAlign: 'center',
  },
  cancelBtn: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
  },
  cancelText: {
    color: '#0288d1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    marginTop: 18,
    backgroundColor: '#0288d1',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skipBtn: {
    marginTop: 14,
    backgroundColor: '#fffde7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#FFD600',
  },
  skipText: {
    color: '#0288d1',
    fontWeight: 'bold',
    fontSize: 15,
  },
});