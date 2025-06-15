import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Alert, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

const PARENT_PASSWORD = 'parent123'; // Replace with your real auth logic

export default function ParentApprovePhotoScreen({ route, navigation }) {
  const { photoUri } = route.params;
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const handleAuth = () => {
    if (password === PARENT_PASSWORD) {
      setAuthenticated(true);
      AccessibilityInfo.announceForAccessibility('Parent authenticated. Approve or reject the photo.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      AccessibilityInfo.announceForAccessibility('Incorrect parent password.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Incorrect Password', 'Please enter the correct parent password.');
    }
  };

  const handleApprove = () => {
    AccessibilityInfo.announceForAccessibility('Photo approved.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('KidProfile', { avatar: photoUri });
  };

  const handleReject = () => {
    AccessibilityInfo.announceForAccessibility('Photo rejected.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parent Approval Required</Text>
      <Image source={{ uri: photoUri }} style={styles.photo} />
      {!authenticated ? (
        <View style={styles.authBox}>
          <Text style={styles.label}>Enter Parent Password:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Parent password"
            secureTextEntry
            accessibilityLabel="Parent password"
            accessibilityRole="keyboardkey"
            onSubmitEditing={handleAuth}
          />
          <TouchableOpacity style={styles.button} onPress={handleAuth} accessibilityRole="button" accessibilityLabel="Approve as Parent">
            <Text style={styles.buttonText}>Approve as Parent</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#0288d1' }]}
            onPress={handleApprove}
            accessibilityRole="button"
            accessibilityLabel="Approve photo"
          >
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#d32f2f' }]}
            onPress={handleReject}
            accessibilityRole="button"
            accessibilityLabel="Reject photo"
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b3e5fc', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0288d1', marginBottom: 24 },
  photo: { width: 200, height: 200, borderRadius: 16, marginBottom: 32, backgroundColor: '#eee' },
  authBox: { alignItems: 'center', width: '80%' },
  label: { fontSize: 16, color: '#0288d1', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#0288d1',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    width: '100%',
    backgroundColor: '#fff',
    fontSize: 16,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'center' },
  button: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: '#0288d1',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});