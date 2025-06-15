import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, AccessibilityInfo } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import * as Haptics from 'expo-haptics';
import Barkley3D from '../../components/Barkley3D'; // Adjust path as needed

export default function AcceptChoreScreen({ route, navigation }) {
  const { choreData, anchorPosition } = route.params || {};
  const [barkleyAnim, setBarkleyAnim] = useState('idle1');
  const [showCelebration, setShowCelebration] = useState(false);

  const handleAccept = async () => {
    if (!choreData || !choreData.chore || !choreData.points || !choreData.assignee) {
      AccessibilityInfo.announceForAccessibility('Chore data missing.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Chore data is missing or incomplete.');
      return;
    }
    try {
      // Save the chore to the child's list in Firestore
      await firestore().collection('chores').add({
        title: choreData.chore,
        points: Number(choreData.points),
        assignee: choreData.assignee,
        status: 'assigned',
        created: Date.now(),
      });
      setBarkleyAnim('idle1'); // Barkley is idle while chore is being done
      AccessibilityInfo.announceForAccessibility(`Chore "${choreData.chore}" accepted!`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Simulate chore completion after a delay (replace with your real logic)
      setTimeout(() => {
        setBarkleyAnim('dmg1'); // Barkley celebrates with dmg1
        setShowCelebration(true);
        AccessibilityInfo.announceForAccessibility('Chore completed! Great job!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          setShowCelebration(false);
          Alert.alert('Chore Accepted!', `You accepted: ${choreData.chore}`);
          navigation.goBack();
        }, 2000); // Show celebration for 2 seconds
      }, 3000); // Simulate 3 seconds of "doing" the chore
    } catch (e) {
      AccessibilityInfo.announceForAccessibility('Could not accept chore.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Could not accept chore. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accept Chore?</Text>
      <Text style={styles.chore}>{choreData?.chore}</Text>
      <Text style={styles.points}>Points: {choreData?.points}</Text>
      <Text style={styles.assignee}>Assigned to: {choreData?.assignee}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleAccept}
        accessibilityRole="button"
        accessibilityLabel="Accept Chore"
      >
        <Text style={styles.buttonText}>Accept</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => {
          AccessibilityInfo.announceForAccessibility('Chore acceptance cancelled.');
          navigation.goBack();
        }}
        accessibilityRole="button"
        accessibilityLabel="Cancel"
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>

      {/* Barkley always visible, animates based on state */}
      <View style={styles.barkleyBox}>
        <Barkley3D
          animation={barkleyAnim}
          position={anchorPosition || [0, 0, 0]}
          style={{ width: 200, height: 200 }}
        />
      </View>

      {/* Optional: Modal overlay for celebration */}
      <Modal visible={showCelebration} transparent animationType="fade">
        <View style={styles.overlay}>
          <Barkley3D
            animation="dmg1"
            position={anchorPosition || [0, 0, 0]}
            style={{ width: 200, height: 200 }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fffbe9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 18, color: '#0288d1' },
  chore: { color: '#795548', fontSize: 20, marginBottom: 10, textAlign: 'center' },
  points: { color: '#0288d1', fontSize: 18, marginBottom: 10 },
  assignee: { color: '#795548', fontSize: 16, marginBottom: 24 },
  button: { backgroundColor: '#0288d1', padding: 12, borderRadius: 8, marginBottom: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 10 },
  cancelText: { color: '#d32f2f', fontSize: 16, textAlign: 'center' },
  barkleyBox: { marginVertical: 24 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)' },
});