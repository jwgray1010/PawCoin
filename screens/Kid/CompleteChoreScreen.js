import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, Modal, AccessibilityInfo } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import useAnchorTracker from '../../hooks/useAnchorTracker';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import Barkley3D from '../../components/Barkley3D';

export default function CompleteChoreScreen({ route, navigation }) {
  const { anchor } = route.params;
  const [status, setStatus] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanType, setScanType] = useState(null); // 'start' or 'end'

  const handleNotifyParent = async (type, anchor, duration) => {
    // ...your Firestore notification logic here...
  };

  const {
    startedAt,
    finishedAt,
    completed,
    duration,
    startChore,
    finishChore,
  } = useAnchorTracker(anchor, handleNotifyParent);

  // Accessibility: Announce status changes
  useEffect(() => {
    if (status === 'started') {
      AccessibilityInfo.announceForAccessibility('Chore started.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (status === 'completed') {
      AccessibilityInfo.announceForAccessibility('Chore completed! Great job!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (status === 'too_short') {
      AccessibilityInfo.announceForAccessibility('Not enough time spent. Try again!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [status]);

  // Accessibility: Announce timer updates every 10 seconds while running
  useEffect(() => {
    if (startedAt && !finishedAt) {
      const interval = setInterval(() => {
        const timeSpent = Math.floor((Date.now() - startedAt) / 1000);
        if (timeSpent % 10 === 0) {
          AccessibilityInfo.announceForAccessibility(`Time spent: ${timeSpent} seconds`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startedAt, finishedAt]);

  const handleBarCodeScanned = ({ data }) => {
    setScanning(false);
    if (scanType === 'start') {
      if (data === anchor.qrStartCode) {
        handleStart();
      } else {
        AccessibilityInfo.announceForAccessibility('Invalid start QR code.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Invalid QR', 'This is not the correct start QR code.');
      }
    } else if (scanType === 'end') {
      if (data === anchor.qrEndCode) {
        handleFinish();
      } else {
        AccessibilityInfo.announceForAccessibility('Invalid finish QR code.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Invalid QR', 'This is not the correct finish QR code.');
      }
    }
    setScanType(null);
  };

  const handleStart = () => {
    startChore();
    setStatus('started');
    Alert.alert('Chore Started', 'You have started this chore!');
  };

  const handleFinish = () => {
    const success = finishChore();
    if (success) {
      setStatus('completed');
      Alert.alert('Chore Completed', 'Great job! You finished the chore.');
    } else {
      setStatus('too_short');
      Alert.alert('Not Enough Time', 'Please spend more time on this chore before finishing.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{anchor.name}</Text>
      <Text style={styles.desc}>{anchor.description}</Text>
      <Text style={styles.label}>Minimum Time: {anchor.minDurationSeconds || 60} seconds</Text>
      <Text style={styles.label}>Status: {status || 'not started'}</Text>
      <View style={styles.buttonRow}>
        <Button
          title="Scan to Start Chore"
          onPress={() => { setScanType('start'); setScanning(true); }}
          disabled={!!startedAt}
          accessibilityLabel="Scan QR code to start chore"
        />
        <Button
          title="Scan to Finish Chore"
          onPress={() => { setScanType('end'); setScanning(true); }}
          disabled={!startedAt || !!finishedAt}
          accessibilityLabel="Scan QR code to finish chore"
        />
      </View>
      <View style={styles.fallbackRow}>
        <TouchableOpacity
          style={styles.fallbackButton}
          onPress={() => {
            Alert.alert(
              'Manual Start',
              'Are you sure you want to start this chore without scanning the QR code?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Start', onPress: handleStart }
              ]
            );
          }}
          disabled={!!startedAt}
          accessibilityRole="button"
          accessibilityLabel="Manual start chore"
        >
          <Text style={styles.fallbackText}>Manual Start</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fallbackButton}
          onPress={() => {
            Alert.alert(
              'Manual Finish',
              'Are you sure you want to finish this chore without scanning the QR code?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Finish', onPress: handleFinish }
              ]
            );
          }}
          disabled={!startedAt || !!finishedAt}
          accessibilityRole="button"
          accessibilityLabel="Manual finish chore"
        >
          <Text style={styles.fallbackText}>Manual Finish</Text>
        </TouchableOpacity>
      </View>
      {completed && (
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Text style={styles.success}>✅ Chore Complete!</Text>
          <Barkley3D animation="dmg1" style={{ width: 180, height: 180 }} />
        </View>
      )}
      {finishedAt && !completed && (
        <Text style={styles.warning}>⏳ Not enough time spent. Try again!</Text>
      )}
      {startedAt && (
        <Text style={styles.timer}>
          Time spent: {finishedAt ? duration : Math.floor((Date.now() - startedAt) / 1000)}s
        </Text>
      )}

      <Modal visible={scanning} animationType="slide">
        <View style={{ flex: 1 }}>
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={{ flex: 1 }}
          />
          <Button title="Cancel" onPress={() => setScanning(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#E6F7FF' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0288d1', marginBottom: 8 },
  desc: { fontSize: 16, color: '#333', marginBottom: 16 },
  label: { fontSize: 15, color: '#0288d1', marginBottom: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 },
  fallbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  fallbackButton: {
    backgroundColor: '#bdbdbd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
  },
  fallbackText: {
    color: '#333',
    fontWeight: 'bold',
  },
  success: { color: 'green', fontWeight: 'bold', fontSize: 18, marginTop: 16 },
  warning: { color: '#d32f2f', fontWeight: 'bold', fontSize: 16, marginTop: 16 },
  timer: { fontSize: 16, color: '#0288d1', marginTop: 12 },
});