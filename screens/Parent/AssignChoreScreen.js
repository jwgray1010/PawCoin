import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, AccessibilityInfo } from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';
import * as Haptics from 'expo-haptics';

const LOGO = require('../../assets/logo.png');

export default function AssignChoreScreen({ navigation }) {
  const [chore, setChore] = useState('');
  const [points, setPoints] = useState('');
  const [assignee, setAssignee] = useState('');
  const [showQR, setShowQR] = useState(false);

  const handleShowQR = () => {
    if (!chore || !points || !assignee) {
      AccessibilityInfo.announceForAccessibility('Please fill in all fields.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }
    setShowQR(true);
    AccessibilityInfo.announceForAccessibility('QR code generated for chore assignment.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const qrData = JSON.stringify({
    type: 'chore',
    chore,
    points,
    assignee,
    timestamp: Date.now(),
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.logoBtn}
        onPress={() => {
          AccessibilityInfo.announceForAccessibility('Returning to home.');
          navigation.navigate('Dashboard');
        }}
        accessibilityRole="button"
        accessibilityLabel="Go to Home"
      >
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </TouchableOpacity>
      <Text style={styles.title}>Assign a Chore</Text>
      <TextInput
        style={styles.input}
        placeholder="Chore name"
        value={chore}
        onChangeText={setChore}
        placeholderTextColor={colors.text}
        accessibilityLabel="Chore name"
      />
      <TextInput
        style={styles.input}
        placeholder="Points"
        value={points}
        onChangeText={setPoints}
        keyboardType="numeric"
        placeholderTextColor={colors.text}
        accessibilityLabel="Points"
      />
      <TextInput
        style={styles.input}
        placeholder="Assign to (child's name)"
        value={assignee}
        onChangeText={setAssignee}
        placeholderTextColor={colors.text}
        accessibilityLabel="Assign to"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleShowQR}
        accessibilityRole="button"
        accessibilityLabel="Show QR for Assignment"
      >
        <Text style={styles.buttonText}>Show QR for Assignment</Text>
      </TouchableOpacity>
      {showQR && (
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <QRCodeSVG value={qrData} size={200} />
          <Text style={{ color: colors.text, marginTop: 12 }}>
            Let your child scan this QR to accept the chore.
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => {
          AccessibilityInfo.announceForAccessibility('Cancelled chore assignment.');
          navigation.goBack();
        }}
        accessibilityRole="button"
        accessibilityLabel="Cancel"
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 16,
    fontSize: 18,
    color: colors.text,
    fontFamily: fonts.regular,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 36,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 18,
    fontFamily: fonts.bold,
    fontWeight: 'bold',
  },
  cancelBtn: {
    marginTop: 8,
    padding: 10,
  },
  cancelText: {
    color: colors.error,
    fontSize: 16,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  logoBtn: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 6,
  },
  logo: {
    width: 36,
    height: 36,
  },
});